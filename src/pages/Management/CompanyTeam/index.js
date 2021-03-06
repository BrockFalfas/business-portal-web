import React from 'react';
import { Icon, Table, Modal } from 'antd';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import moment from 'moment';
import classnames from 'classnames';

import Header from '~components/Header';
import Box from '~components/Box';
import TooltipButton from '~components/TooltipButton';
import RefreshButton from '~components/RefreshButton';
import makeDefaultPagination from '~utils/pagination';
import NotificationService from '~services/notification';
import './CompanyTeam.scss';

const Column = Table.Column;

export class CompanyTeam extends React.Component {
  static propTypes = {
    invitationList: PropTypes.arrayOf(PropTypes.object),
    invitationPagination: PropTypes.object,
    isLoading: PropTypes.bool,
  };

  state = {
    invitationList: [],
    pagination: makeDefaultPagination(),
    invitationPagination: null,
  };

  componentDidMount() {
    this.handleRefresh();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.invitationList !== prevState.invitationList) {
      return {
        invitationList: nextProps.invitationList,
      };
    }
    if (nextProps.invitationPagination !== prevState.invitationPagination) {
      let pag = prevState.pagination;
      return {
        invitationPagination: nextProps.invitationPagination,
        pagination: { ...pag, total: nextProps.invitationPagination.total },
      };
    }
    return null;
  }

  handleTableChange = pag => {
    const { getInvitations } = this.props;
    const { pagination } = this.state;
    let curr = pag.current;
    if (pagination.pageSize !== pag.pageSize) {
      curr = 1;
    }
    this.setState({ pagination: { ...pag, current: curr } });
    getInvitations({
      type: 'admin',
      page: curr,
      limit: pag.pageSize,
    });
  };

  handleRefresh = () => {
    const { getInvitations } = this.props;
    const { pagination } = this.state;
    getInvitations({
      type: 'admin',
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  handleAdd = () => {
    const { isLoading } = this.props;
    if (isLoading) {
    } else {
      this.props.history.push(`/management/company-team/add`);
    }
  };

  handleDelete = async row => {
    const { deleteInvitation } = this.props;
    const { email, id } = row;
    Modal.confirm({
      title: `Are you sure you want to delete invitation to ${email}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteInvitation({ userId: id });
          NotificationService.open({
            type: 'success',
            message: 'Success',
            description: `Invitation to ${email} successfully deleted.`,
          });
        } catch (err) {
          NotificationService.open({
            type: 'error',
            message: 'Error',
            description: `Can not delete invitation to ${email}`,
          });
        }
        return this.handleRefresh();
      },
    });
  };

  handleResend = async row => {
    const { resendInvitation } = this.props;
    const { email, id } = row;

    try {
      await resendInvitation({ id });
      NotificationService.open({
        type: 'success',
        message: 'Success',
        description: `Invitation to ${email} successfully resent.`,
      });
    } catch (err) {
      NotificationService.open({
        type: 'error',
        message: 'Error',
        description: `Can not resend invitation to ${email}`,
      });
    }
    return this.handleRefresh();
  };

  render() {
    const { isLoading } = this.props;
    const { invitationList, pagination } = this.state;
    const title = `${invitationList.length} ${invitationList.length === 1 ? 'User' : 'Users'}`;
    return (
      <div className="CompanyTeam">
        <Header title={title} size="medium">
          <TooltipButton tooltip="Add admin" type="primary" onClick={this.handleAdd}>
            <Icon type="plus" theme="outlined" />
          </TooltipButton>
          <RefreshButton handleRefresh={this.handleRefresh} isLoading={isLoading} />
        </Header>
        <Box>
          <Table
            dataSource={invitationList}
            className="CompanyTeam__table"
            rowKey="id"
            onChange={this.handleTableChange}
            pagination={pagination}
            loading={isLoading}>
            <Column align="left" dataIndex="email" title="Email" />
            <Column
              align="center"
              className="CompanyTeam__date"
              dataIndex="createdAt"
              title="Post Date"
              render={text => {
                return (
                  <div>
                    {moment(text)
                      .format('MM/DD/YY, hh:mm')
                      .toString()}
                  </div>
                );
              }}
            />
            <Column
              align="center"
              dataIndex="status"
              title="Status"
              render={text => {
                return (
                  <div
                    className={classnames('CompanyTeam__status', {
                      'CompanyTeam__status--pending': text === 'pending',
                      'CompanyTeam__status--used': text === 'used',
                    })}>
                    {text}
                  </div>
                );
              }}
            />
            <Column
              align="center"
              title="Actions"
              className="CompanyTeam__actions"
              render={(text, record) => {
                return (
                  <span className="CompanyTeam__table__buttons">
                    {record.status === 'pending' && (
                      <div>
                        <TooltipButton
                          tooltip="Delete invitation"
                          onClick={() => this.handleDelete(record)}>
                          <Icon type="delete" theme="outlined" />
                        </TooltipButton>
                        <TooltipButton
                          tooltip="Resend invitation"
                          onClick={() => this.handleResend(record)}>
                          <Icon type="mail" theme="outlined" />
                        </TooltipButton>
                      </div>
                    )}
                  </span>
                );
              }}
            />
          </Table>
        </Box>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  invitationList: state.invitations.invitationList,
  invitationPagination: state.invitations.invitationPagination,
  isLoading: state.loading.effects.invitations.getInvitations,
});

const mapDispatchToProps = dispatch => ({
  getInvitations: dispatch.invitations.getInvitations,
  deleteInvitation: dispatch.invitations.deleteInvitation,
  resendInvitation: dispatch.invitations.resendInvitation,
});

export default connect(mapStateToProps, mapDispatchToProps)(CompanyTeam);
