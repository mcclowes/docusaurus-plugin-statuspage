import React from 'react'
import Layout from '@theme/Layout'

export default function Home() {
  return (
    <Layout title="Home" description="Statuspage Plugin Example">
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Statuspage Plugin Example</h1>
        <p>
          This example site demonstrates the{' '}
          <code>docusaurus-plugin-statuspage</code> plugin.
        </p>
        <p>
          When there&apos;s a degraded status or active incident, a banner will
          appear.
        </p>
        <p>
          <a href="/docs/intro">View Documentation →</a>
        </p>
      </main>
    </Layout>
  )
}
