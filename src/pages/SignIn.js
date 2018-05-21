import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  loginEmlPwd,
  loginGoogle,
  loginTwitter,
  resetPassword,
  testDB,
  logout,
} from '~redux/actions/login';

class Login extends React.Component {
  state = {
    email: '',
    password: '',
    captchaVerfied: true,
    errorMsg: '',
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.login.loginErrorMsg !== prevState.errorMsg) {
      return { errorMsg: nextProps.login.loginErrorMsg };
    }
    return null;
  }
  render() {
    const { errorMsg } = this.state;

    return (
      <div data-w-id="fd910b6f-3c58-69d2-e4e0-fff6f11f0166" className="whitelist-reg non-fixed">
        <div className="part-2">
          <h1 className="small-h1">Whitelist Sign In</h1>
          <div className="sm-text">
            Not registered yet?{' '}
            <a href="register" className="link">
              Register Here.
            </a>
          </div>
          <div className="email-pass-form w-form">
            <form
              id="wf-form-Sign-In-Form"
              name="wf-form-Sign-In-Form"
              data-name="Sign In Form"
              data-redirect="http:\/\/tokensale.webflow.io/info"
              redirect="http:\/\/tokensale.webflow.io/info">
              <label htmlFor="name" className="field-label">
                Email
              </label>
              <input
                type="email"
                className="style-input w-input"
                maxLength="256"
                name="email"
                data-name="Name"
                onChange={this.handleInputChange}
                placeholder="Enter your email"
                id="name"
              />
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                type="password"
                className="style-input w-input"
                maxLength="256"
                name="password"
                onChange={this.handleInputChange}
                data-name="password"
                placeholder="Enter you password"
                id="password"
                required=""
              />
              {errorMsg && (
                <div className="w-form-fail">
                  <div>{errorMsg}</div>
                </div>
              )}
              {errorMsg &&
                errorMsg.indexOf('invalid') > -1 && (
                  <div className="sm-text" style={{ marginTop: 20 }}>
                    Need to reset your password?{' '}
                    <a href="#" className="link" onClick={this.resetPassword}>
                      Reset Password
                    </a>
                  </div>
                )}
              <input
                type="submit"
                value="Next"
                data-wait="Please wait..."
                className="sign-up-btn grey w-button"
                onClick={this.handleLogin}
              />
              <div className="or">OR</div>
              <a
                href="#"
                onClick={this.handleGoogleLogin}
                className="sign-up-btn google w-inline-block">
                <img
                  alt="Google"
                  src="images/WhiteG.png"
                  width="30"
                  srcSet="images/WhiteG-p-500.png 500w, images/WhiteG.png 654w"
                  sizes="30px"
                  className="button-icon"
                />
                <div className="sign-in-with-g">Sign in with Google</div>
              </a>
              <a
                href="#"
                onClick={this.handleTwitterLogin}
                className="sign-up-btn google w-inline-block">
                <img
                  alt="Twitter"
                  src="images/twitter-tinywhitebird.png"
                  width="40"
                  className="button-icon"
                />
                <div className="sign-in-with-g">Sign in with Twitter</div>
              </a>
            </form>
            <div className="w-form-done">
              <div>Thank you! Your submission has been received!</div>
            </div>
            <div className="w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  handleVerification = response => {
    this.setState({ captchaVerfied: true });
  };
  handleInputChange = event => {
    const target = event.target;
    const { name } = target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [name]: value,
      displayError: 'none',
    });
  };
  handleLogin = event => {
    event.preventDefault();
    let email = this.state.email;
    let pwd = this.state.password;
    this.props.loginEmlPwd(email, pwd);
  };
  handleGoogleLogin = event => {
    event.preventDefault();
    if (this.state.captchaVerfied) {
      this.props.loginGoogle();
    }
  };
  handleTwitterLogin = event => {
    event.preventDefault();
    if (this.state.captchaVerfied) {
      this.props.loginTwitter();
    }
  };
  resetPassword = event => {
    event.preventDefault();
    this.props.resetPassword(this.state.email);
  };
}

const mapStateToProps = state => ({
  login: state.login,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loginEmlPwd,
      testDB,
      logout,
      loginGoogle,
      loginTwitter,
      resetPassword,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);