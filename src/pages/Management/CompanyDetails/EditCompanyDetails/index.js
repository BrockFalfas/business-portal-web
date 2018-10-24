import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Formik } from 'formik';

import FormField from '~components/FormField';

import { formFields, validationSchema } from './formSchema';
import './EditCompanyDetails.scss';
import NotificationService from '../../../../services/notification';

import { handleFormHttpResponse } from '~utils/forms/errors';

export class EditCompanyDetails extends React.Component {
  static propTypes = {
    formValues: PropTypes.object.isRequired,
    editTenantCompany: PropTypes.func.isRequired,
  };

  render() {
    const { formValues } = this.props;
    return (
      <div className="EditCompanyDetails">
        <Formik
          initialValues={formValues}
          onSubmit={this.handleSubmit}
          validationSchema={validationSchema}>
          {this.renderForm}
        </Formik>
      </div>
    );
  }

  renderForm = ({ handleSubmit, isSubmitting, values, dirty }) => (
    <form onSubmit={handleSubmit}>
      {Object.entries(formFields).map(([name, options]) => (
        <FormField key={name} name={name} label={options.label} {...options.input} />
      ))}

      <div className="EditCompanyDetails__button-container">
        <Button
          disabled={!dirty || isSubmitting}
          size="large"
          type="primary"
          loading={isSubmitting}
          htmlType="submit"
          className="EditCompanyDetails__button-container--button">
          Save
        </Button>
      </div>
    </form>
  );

  handleSubmit = async (data, form) => {
    const { editTenantCompany } = this.props;
    const normalizedData = validationSchema.cast(data);
    try {
      await editTenantCompany(normalizedData);
      this.handleSubmitSuccess();
    } catch (err) {
      handleFormHttpResponse(form, err.response.data.error, err.response);
    }
  };

  handleSubmitSuccess = () => {
    NotificationService.open({
      type: 'success',
      message: 'Success',
      description: 'Company Details successfully edited.',
    });
  };
}

const mapDispatchToProps = dispatch => ({
  editTenantCompany: dispatch.tenantCompany.editTenantCompany,
});

export default connect(null, mapDispatchToProps)(EditCompanyDetails);
