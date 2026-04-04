import { Box, Tabs } from '@radix-ui/themes'
import { Heading } from '@radix-ui/themes/dist/cjs/components/index.js'
import React, { useState } from 'react'
import { useQueryParams } from './hooks/useQueryParams.hook'

const SearchDomain = React.lazy(() => import('@/components/search-domain.tab'))
const MyDomains = React.lazy(() => import('@/components/my-domain.tab'))

function App() {

  const { getQueryParam, setQueryParam } = useQueryParams()

  const [value, setValue] = useState<string>(getQueryParam("t"))

  return (
    <main className='flex flex-col gap-2'>
      <Heading size="6" weight="bold">
        DomainWatcher
      </Heading>

      <Tabs.Root defaultValue={value} onValueChange={(v) => {
        setValue(v)
        setQueryParam("t", v)
      }}>
        <Tabs.List>
          <Tabs.Trigger value="" >
            Seatch Domains
          </Tabs.Trigger>
          <Tabs.Trigger value="my-domains">
            My Domains
          </Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value=''>
            <SearchDomain />
          </Tabs.Content>

          <Tabs.Content value='my-domains'>
            <MyDomains />
          </Tabs.Content>
        </Box>

      </Tabs.Root>

    </main>
  )
}

export default App



