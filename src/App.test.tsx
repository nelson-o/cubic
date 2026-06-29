import { expect, test } from 'bun:test'
import { renderToString } from 'react-dom/server'
import App from './App'

test('renders the first guided replay and its accessible controls', () => {
  const html = renderToString(<App />)

  expect(html).toContain('Flip a white edge')
  expect(html).toContain('Play replay')
  expect(html).toContain('All cases')
  expect(html).toContain('Previous case')
  expect(html).toContain('Replay speed')
  expect(html).not.toContain('Camera distance')
  expect(html).not.toContain('step="0.1"')
  expect(html.indexOf('class="replay-controls"')).toBeLessThan(html.indexOf('<h1>'))
})
