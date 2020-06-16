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
import { observer, inject } from 'mobx-react'
import { get, isEmpty, keyBy } from 'lodash'

import WorkloadStore from 'stores/workload'
import FedStore from 'stores/federated'

import PodsCard from 'components/Cards/Pods'
import ClusterWorkloadStatus from 'fedprojects/components/ClusterWorkloadStatus'

import styles from './index.scss'

@inject('detailStore', 'projectStore')
@observer
export default class ResourceStatus extends React.Component {
  constructor(props) {
    super(props)

    this.store = props.detailStore

    this.workloadName = get(
      this.store.detail.annotations,
      '["kubesphere.io/workloadName"]'
    )

    const workloadModule = get(
      this.store.detail.annotations,
      '["kubesphere.io/workloadModule"]',
      'deployments'
    )

    this.workloadStore = new FedStore(new WorkloadStore(workloadModule))
  }

  componentDidMount() {
    this.fetchData()
  }

  get prefix() {
    return `/${this.props.match.params.workspace}`
  }

  fetchData = async () => {
    const { namespace } = this.props.match.params
    const name = this.workloadName

    const clusters = this.props.projectStore.detail.clusters.map(
      item => item.name
    )
    if (name) {
      this.workloadStore.fetchDetail({ name, namespace })
      this.workloadStore.fetchResources({
        name,
        namespace,
        clusters,
      })
    }
  }

  handlePodUpdate = cluster => {
    const { detail } = this.workloadStore
    this.workloadStore.fetchResources({
      name: detail.name,
      clusters: [cluster],
      namespace: detail.namespace,
    })
  }

  renderReplicaInfo() {
    const { detail, resources, isResourcesLoading } = this.workloadStore
    const clusters = keyBy(this.props.projectStore.detail.clusters, 'name')

    return (
      <ClusterWorkloadStatus
        module={this.workloadStore.module}
        store={this.workloadStore}
        detail={detail}
        resources={resources}
        clusters={clusters}
        isLoading={isResourcesLoading}
      />
    )
  }

  renderWorkloadPods() {
    const { resources } = this.workloadStore
    const clusters = Object.keys(resources)
    const detail = Object.values(resources)[0]

    if (isEmpty(clusters) || isEmpty(detail)) {
      return null
    }

    return (
      <PodsCard
        prefix={this.prefix}
        detail={detail}
        clusters={clusters}
        onUpdate={this.handlePodUpdate}
        isFederated
      />
    )
  }

  renderPods() {
    const { resources, isResourcesLoading } = this.store

    const clusters = this.props.projectStore.detail.clusters.map(
      item => item.name
    )
    const detail = Object.values(resources)[0]

    return (
      <PodsCard
        prefix={this.prefix}
        detail={detail}
        clusters={clusters}
        onUpdate={this.handlePodUpdate}
        isLoading={isResourcesLoading}
        isFederated
      />
    )
  }

  renderContent() {
    if (!this.workloadName) {
      return this.renderPods()
    }

    return (
      <div>
        {this.renderReplicaInfo()}
        {this.renderWorkloadPods()}
      </div>
    )
  }

  render() {
    return <div className={styles.main}>{this.renderContent()}</div>
  }
}