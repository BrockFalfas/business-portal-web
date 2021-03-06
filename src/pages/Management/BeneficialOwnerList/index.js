import React from 'react';
import { Icon, Modal, Table } from 'antd';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import Box from '~components/Box';
import TooltipButton from '~components/TooltipButton';
import RefreshButton from '~components/RefreshButton';
import Header from '~components/Header';
import makeDefaultPagination from '~utils/pagination';
import './BeneficialOwnerList.scss';

const { Column } = Table;

export class BeneficialOwnerList extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    beneficialOwnerList: PropTypes.arrayOf(PropTypes.object),
    beneficialOwnerPagination: PropTypes.object,
  };
  state = {
    beneficialOwnerList: [],
    pagination: makeDefaultPagination(),
    beneficialOwnerPagination: null,
  };

  componentDidMount() {
    this.handleRefresh();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.beneficialOwnerList !== prevState.beneficialOwnerList) {
      return {
        beneficialOwnerList: nextProps.beneficialOwnerList,
      };
    }
    if (nextProps.beneficialOwnerPagination !== prevState.beneficialOwnerPagination) {
      let pag = prevState.pagination;
      return {
        beneficialOwnerPagination: nextProps.beneficialOwnerPagination,
        pagination: { ...pag, total: nextProps.beneficialOwnerPagination.total },
      };
    }
    return null;
  }

  handleRefresh = () => {
    const { getBeneficialOwners } = this.props;
    const { pagination } = this.state;
    getBeneficialOwners({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  handleAdd = () => {
    const { isLoading } = this.props;
    if (isLoading) {
    } else {
      this.props.history.push(`/management/beneficial-owners/add`);
    }
  };

  handleTableChange = pag => {
    const { getBeneficialOwners } = this.props;
    const { pagination } = this.state;
    let curr = pag.current;
    if (pagination.pageSize !== pag.pageSize) {
      curr = 1;
    }
    this.setState({ pagination: { ...pag, current: curr } });
    getBeneficialOwners({
      page: curr,
      limit: pag.pageSize,
    });
  };

  handleEdit = row => {
    console.log('edit', row);
  };

  handleDelete = async row => {
    const { deleteBeneficialOwner } = this.props;
    const { id, firstName, lastName } = row;
    Modal.confirm({
      title: `Are you sure you want to delete ${firstName} ${lastName}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        await deleteBeneficialOwner(id);
        return this.handleRefresh();
      },
    });
  };

  render() {
    const { isLoading } = this.props;
    const { pagination, beneficialOwnerList } = this.state;
    return (
      <div className="BeneficialOwnerList">
        <Header title="Beneficial Owners List" size="medium">
          <TooltipButton type="primary" onClick={this.handleAdd} tooltip="Add beneficial owner">
            <Icon type="plus" theme="outlined" />
          </TooltipButton>
          <RefreshButton handleRefresh={this.handleRefresh} isLoading={isLoading} />
        </Header>
        <Box>
          <Table
            dataSource={beneficialOwnerList}
            className="BeneficialOwnerList__table"
            rowKey="id"
            onChange={this.handleTableChange}
            pagination={pagination}
            loading={isLoading}>
            <Column align="center" dataIndex="firstName" title="First Name" />
            <Column align="center" dataIndex="lastName" title="Last Name" />
            <Column align="center" dataIndex="address.city" title="City" />
            <Column align="center" dataIndex="address.stateProvinceRegion" title="State" />
            <Column align="center" dataIndex="verificationStatus" title="Status" />
            <Column
              align="center"
              title="Actions"
              render={(text, record) => {
                return (
                  <span className="BeneficialOwnerList__table__buttons">
                    {/*<Button onClick={() => this.handleEdit(record)}>*/}
                    {/*<Icon type="form" theme="outlined" />*/}
                    {/*</Button>*/}
                    <TooltipButton
                      tooltip="Delete beneficial owner"
                      onClick={() => this.handleDelete(record)}>
                      <Icon type="delete" theme="outlined" />
                    </TooltipButton>
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
  beneficialOwnerList: state.beneficialOwners.beneficialOwnerList,
  beneficialOwnerPagination: state.beneficialOwners.beneficialOwnerPagination,
  isLoading: state.loading.effects.beneficialOwners.getBeneficialOwners,
});

const mapDispatchToProps = dispatch => ({
  getBeneficialOwners: dispatch.beneficialOwners.getBeneficialOwners,
  deleteBeneficialOwner: dispatch.beneficialOwners.deleteBeneficialOwner,
});

export default connect(mapStateToProps, mapDispatchToProps)(BeneficialOwnerList);
