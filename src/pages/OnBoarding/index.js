import React from 'react';

import { Steps, Icon, Spin } from 'antd';

import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import SignUp from './SignUp';
import Bank from './Bank';
import Terms from './Terms';
import NotificationService from '~services/notification';

import './OnBoarding.scss';

const Step = Steps.Step;

export class OnBoarding extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        invitationId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    contractor: PropTypes.object,
    agreement: PropTypes.bool,
    step: PropTypes.number,
  };

  state = {
    ready: false,
    contractor: null,
    agreement: false,
  };

  async componentDidMount() {
    const { checkInvitation, getAgreement, changeStep, match, token } = this.props;
    if (match.params.invitationId === 'bank' && token) {
      changeStep(2);
    } else {
      const invitation = await checkInvitation(match.params.invitationId);
      if (invitation.status === 200) {
        await getAgreement();
      } else if (invitation.status === 406) {
        this.sendWarning(`${invitation.data.error}. Sign in with your credentials.`);
      } else if (invitation.status === 404) {
        this.sendWarning('Wrong invitation token.');
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let localState = {};
    if (nextProps.contractor !== prevState.contractor) {
      localState['contractor'] = nextProps.contractor;
      localState['ready'] = true;
    }
    if (nextProps.agreement !== prevState.agreement) {
      localState['agreement'] = nextProps.agreement;
    }
    return Object.keys(localState).length ? localState : null;
  }

  sendWarning = warning => {
    const { history } = this.props;
    history.push('/sign-in');
    NotificationService.open({
      type: 'warning',
      message: 'Warning',
      description: warning,
    });
  };

  render() {
    const { step, match } = this.props;
    const { ready } = this.state;
    if (step === 2 && !ready) {
      this.setState({ ready: true });
    }
    const steps = [
      {
        title: 'Terms',
        icon: 'solution',
        content: () => <Terms />,
      },
      {
        title: 'Sign Up',
        icon: 'user',
        content: () => <SignUp invToken={match.params.invitationId} />,
      },
      {
        title: 'Bank Account',
        icon: 'dollar',
        content: () => <Bank />,
      },
      {
        title: 'Done',
        icon: 'smile-o',
        content: () => <Terms />,
      },
    ];
    return (
      <div className="OnBoarding">
        <div className="OnBoarding__container">
          <div className="OnBoarding__steps">
            <Steps current={step}>
              {steps.map(item => (
                <Step
                  key={item.title}
                  title={item.title}
                  icon={<Icon type={item.icon} theme="outlined" />}
                />
              ))}
            </Steps>
          </div>

          <div className="OnBoarding__steps--content">
            {!ready && <Spin size="large" className="OnBoarding__steps--spin" />}
            {ready && steps[step].content()}
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  contractor: state.onBoarding.contractor,
  step: state.onBoarding.step,
  agreement: state.onBoarding.agreement,
  isLoading: state.loading.effects.onBoarding.checkInvitation,
  token: state.auth.token,
});

const mapDispatchToProps = dispatch => ({
  checkInvitation: dispatch.onBoarding.checkInvitation,
  getAgreement: dispatch.onBoarding.getAgreement,
  changeStep: dispatch.onBoarding.changeStep,
});

export default connect(mapStateToProps, mapDispatchToProps)(OnBoarding);
