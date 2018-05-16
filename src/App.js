import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import Register from "./pages/register";
import SignIn from "./pages/signIn";
import Status from "./pages/status";
import UserInfo from "./pages/userInfo";
import Dashboard from "./pages/dashboard";

import { logout } from "./redux/actions/login";
import "./css/app.css";
import "./css/index.css";
import "./css/normalize.css";
import "./css/tokensale.webflow.css";
import "./css/webflow.css";
import "./utilities.js";

export default class App extends React.Component {
  render() {
    return (
      <div>
        <Route exact path="/" component={Dashboard} />
      </div>
    );
  }
}
