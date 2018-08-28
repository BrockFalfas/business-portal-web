import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Spin } from 'antd';
import { Formik } from 'formik';

import Notification from '~services/notification';
import FormField from '~components/FormField';

import {
  initialValues,
  formFields,
  transformData,
  transformDateToMoment,
  validationSchema,
} from './formSchema';
import './EditContractor.css';

export class EditContractor extends React.Component {
  static propTypes = {
    getUser: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    onClose: PropTypes.func,
    updateProfile: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onClose: () => {},
  };

  state = {
    error: null,
    formData: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.currentUser && nextProps.currentUser.id !== prevState.formData.id) {
      return {
        formData: transformData(nextProps.currentUser),
      };
    }

    return null;
  }

  componentDidMount() {
    const { currentUser = {}, match } = this.props;

    if (!currentUser || currentUser.id !== match.params.id) {
      this.getContractorData();
    }
  }

  componentDidUpdate(prevProps) {
    const { currentUser = {}, match } = this.props;
    const prevMatch = prevProps.match;

    if (prevMatch.params.id !== match.params.id && currentUser.id !== match.params.id) {
      this.getContractorData();
    }
  }

  getContractorData = async () => {
    const { getUser, match } = this.props;

    return getUser(match.params.id);
  };

  updateContractor = async profile => {
    const {
      match: {
        params: { id },
      },
      updateProfile,
    } = this.props;

    const data = {
      ...profile,
      dateOfBirth: transformDateToMoment(profile.dateOfBirth).format('YYYY-MM-DD'),
    };
    await updateProfile({ id, profile: data });
  };

  handleSubmit = async (data, form) => {
    try {
      await this.updateContractor(data);

      this.handleSubmitSuccess();
    } catch (err) {
      if (err.response) {
        this.setState({ error: err.response.data.error });
      }
      form.setSubmitting(false);
    }
  };

  handleSubmitSuccess = () => {
    this.setState({ error: null });
    Notification.success({ message: 'Changes have been applied successfully.' });
    this.props.onClose();
  };

  render() {
    const { error, formData } = this.state;
    const { isLoading } = this.props;

    return (
      <Spin spinning={isLoading}>
        <div className="Edit-contractor">
          <div className="Edit-contractor__errors">{error}</div>
          <Formik
            initialValues={initialValues(formData)}
            onSubmit={this.handleSubmit}
            validationSchema={validationSchema}
            enableReinitialize>
            {({ handleSubmit, isSubmitting, values, dirty }) => (
              <form onSubmit={handleSubmit}>
                {Object.entries(formFields).map(([name, options]) => (
                  <FormField key={name} name={name} label={options.label} {...options.input} />
                ))}

                <div className="Edit-contractor__button-container">
                  <Button
                    disabled={!dirty || isSubmitting}
                    size="large"
                    type="primary"
                    loading={isSubmitting}
                    htmlType="submit"
                    className="Edit-contractor__button-container--button">
                    Update {values.firstName}
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </Spin>
    );
  }
}

const mapState = ({ loading, users: { currentUser } }) => ({
  currentUser,
  isLoading: loading.effects.users.get,
});
const mapDispatch = ({ users: { get, updateProfile } }) => ({
  getUser: get,
  updateProfile,
});

export default connect(mapState, mapDispatch)(EditContractor);
