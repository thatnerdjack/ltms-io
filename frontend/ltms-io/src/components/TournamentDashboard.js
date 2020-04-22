import React, { Component } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import axios from 'axios'
import { Link } from 'react-router-dom'
import jsonWeb from 'jsonwebtoken';

export default class TournamentDashboard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tourneyId: this.props.match.params.tourneyId,
      dbresults: {},
      dbtournresults: {},
      dbteamnames: [],
      authresults: {},
      setRefereeAuthorized: false,
      rubricEntryAuthorized: false,
      judgeAuthorized: false,
      createTeamAuthorized: false,
      viewRubricsAuthorized: false,
      headRef: false
    }

    this.updateState = this.updateState.bind(this);
}

  async componentDidMount() {
    await this.updateState();

    if (this.state.dbtournresults.headReferee === this.state.dbresults._id ||
      this.state.dbtournresults.director === this.state.dbresults._id) {
      this.state.setRefereeAuthorized = true;
    }

    if (this.state.dbtournresults.director === this.state.dbresults._id) {
      this.state.rubricEntryAuthorized = true;
      this.state.judgeAuthorized = true;
      this.state.createTeamAuthorized = true;
      this.state.viewRubricsAuthorized = true;
    } else {
      for (var i = 0; i < this.state.dbtournresults.judgeAdvisor.length; i++) {
        if (this.state.dbtournresults.judgeAdvisor[i] === this.state.dbresults._id) {
          this.state.rubricEntryAuthorized = true;
          this.state.judgeAuthorized = true;
          this.state.viewRubricsAuthorized = true;
        }
      }
      if (!this.state.isAuthorized) {
        for (var j = 0; j < this.state.dbtournresults.judges.length; j++) {
          if (this.state.dbtournresults.judges[j] === this.state.dbresults._id) {
            this.state.rubricEntryAuthorized = true;
            this.state.rubricEntryAuthorized = true;
            this.state.judgeAuthorized = true;
          }
        }
      }
    }

    for (var k = 0; k < this.state.dbtournresults.headReferee.length; k++) {
      if (this.state.dbtournresults.headReferee[k] === this.state.dbresults._id) {
        this.state.headRef = true;
      }
    }

    this.setState(this.state);
    console.log("INITIAL TOURNAMENT DASHBOARD STATE", this.state);
  }

  render() {
    return (
      <Container style={{paddingLeft: 0, marginLeft: 0}}>
        <Row>
          <Col style={{background: "gray", height: "100vh"}}>
            <div className="pl-3 pt-2" >
              <h1>{this.state.dbtournresults.name}</h1>
              <hr />
              <h3>{new Date(this.state.dbtournresults.startDate).toLocaleDateString()} - {new Date(this.state.dbtournresults.endDate).toLocaleDateString()}</h3>
              <hr />
            </div>
          </Col>

          <Col>
            <Link to={"/setreferee/" + this.state.tourneyId}>
              <Button disabled={!this.state.setRefereeAuthorized}>Set Referee</Button>
            </Link>
            {this.state.dbtournresults.teams && (
              <div>
                {this.state.dbtournresults.teams.map((item, i) => {
                  return (
                    <Link key={i} to={"/rubricentry/" + this.state.tourneyId + "/" + item}>
                      <Button disabled={!this.state.rubricEntryAuthorized}>Rubric Entry for {this.state.dbteamnames[i]}</Button>
                    </Link>
                  );
                })}
              </div>
            )}
            {this.state.headRef && ( //TODO set to head ref only
              <Link to={"/t/" + this.state.tourneyId + "/mscores"}>
                <Button>See Scores</Button>
              </Link>
            )}

            {true && (
              <Link to={"/matchranking/" + this.state.tourneyId}>
                <Button>See Tournament Rankings</Button>
              </Link>
            )}

            <Link to={"/createteam/" + this.state.tourneyId}>
            <Button disabled = {!this.state.createTeamAuthorized}> Create Team</Button>
            </Link>
            <Link to={"/viewrubrics/" + this.state.tourneyId}>
            <Button disabled = {!this.state.viewRubricsAuthorized}> View Rubrics</Button>
            </Link>
            <Link to={"/createjudge/" + this.state.tourneyId}>
            <Button disabled = {!this.state.viewRubricsAuthorized}> Create Judges</Button>
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }

  async updateState() {
    await axios({
      method: 'GET',
      url: `https://dev-s68c-q-y.auth0.com/userinfo`,
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + localStorage.getItem("access_token")
      },
      json: true
    })
    .then((result) => {
      this.state.authresults = result.data;
    })
    .catch((error) => {
      console.log(error);
    });

    var token = document.cookie.substring(13);
    var decoded = jsonWeb.verify(token, "123456");

    this.state.dbresults = decoded;

    this.setState(this.state)

    await axios.get(`/api/tournaments/${this.state.tourneyId}`)
    .then((result) => {
      this.state.dbtournresults = result.data;
    }).catch((error) => {
      console.log(error);
    });

    for (let i = 0; i < this.state.dbtournresults.teams.length; i++) {
      await axios.get(`/api/teams/${this.state.dbtournresults.teams[i]}`)
      .then((result) => {
        this.state.dbteamnames[i] = result.data.teamName;
      }).catch((error) => {
        console.log(error);
      });
    }

    this.setState(this.state);
  }
}
