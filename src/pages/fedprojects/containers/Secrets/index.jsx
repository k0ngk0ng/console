/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'

import { Avatar } from 'components/Base'
import Banner from 'components/Cards/Banner'
import { withProjectList, ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime, getDisplayName } from 'utils'
import { ICON_TYPES, SECRET_TYPES } from 'utils/constants'

import FederatedStore from 'stores/federated'

@withProjectList({
  store: new FederatedStore({ module: 'secrets' }),
  module: 'secrets',
  name: 'Secret',
})
export default class Secrets extends React.Component {
  get itemActions() {
    const { getData, trigger } = this.props
    return [
      {
        key: 'edit',
        icon: 'pen',
        text: t('Edit'),
        action: 'edit',
        onClick: item =>
          trigger('resource.baseinfo.edit', {
            detail: item,
          }),
      },
      {
        key: 'editYaml',
        icon: 'pen',
        text: t('Edit YAML'),
        action: 'edit',
        onClick: item =>
          trigger('resource.yaml.edit', {
            detail: item,
          }),
      },
      {
        key: 'editSecret',
        icon: 'pen',
        text: t('Edit Secret'),
        action: 'edit',
        onClick: item =>
          trigger('secret.edit', {
            detail: item.resource,
            success: getData,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('Delete'),
        action: 'delete',
        onClick: item =>
          trigger('resource.delete', {
            type: t(this.name),
            detail: item,
            success: getData,
          }),
      },
    ]
  }

  getColumns = () => {
    const { getSortOrder, module } = this.props
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        search: true,
        render: (name, record) => (
          <Avatar
            icon={ICON_TYPES[module]}
            iconSize={40}
            title={getDisplayName(record)}
            desc={record.description || '-'}
            to={`${this.props.match.url}/${name}`}
            isMultiCluster={record.isFedManaged}
          />
        ),
      },
      {
        title: t('Type'),
        dataIndex: 'resource.type',
        isHideable: true,
        width: '24%',
        render: type => t(SECRET_TYPES[type] || type),
      },
      {
        title: t('Config Number'),
        dataIndex: 'resource.data',
        isHideable: true,
        width: '20%',
        render: data => Object.keys(data).length,
      },
      {
        title: t('Created Time'),
        dataIndex: 'createTime',
        sorter: true,
        sortOrder: getSortOrder('createTime'),
        isHideable: true,
        width: 150,
        render: time => getLocalTime(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  showCreate = () => {
    const { match, module, getData, projectStore } = this.props
    return this.props.trigger('secret.create', {
      module,
      isFederated: true,
      projectDetail: projectStore.detail,
      namespace: match.params.namespace,
      success: getData,
    })
  }

  render() {
    const { bannerProps, tableProps } = this.props
    return (
      <ListPage {...this.props}>
        <Banner {...bannerProps} tabs={this.tabs} />
        <Table
          {...tableProps}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          onCreate={this.showCreate}
        />
      </ListPage>
    )
  }
}
