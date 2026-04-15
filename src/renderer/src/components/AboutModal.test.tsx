// @vitest-environment jsdom
import { render, screen, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AboutModal } from './AboutModal'

beforeEach(() => {
  const mockApi = {
    getVersion: vi.fn().mockResolvedValue('1.2.3'),
    checkForUpdates: vi.fn().mockResolvedValue({ updateAvailable: false, latestVersion: '', releaseUrl: '' }),
    getPreferences: vi.fn().mockResolvedValue({ analyticsEnabled: true }),
    setPreferences: vi.fn().mockResolvedValue(undefined),
    reportBug: vi.fn().mockResolvedValue({ success: true }),
    logError: vi.fn(),
    logWarn: vi.fn(),
    logInfo: vi.fn(),
    getLogPath: vi.fn().mockResolvedValue('/mock/log'),
  }
  // @ts-ignore
  window.api = mockApi
})

describe('AboutModal', () => {
  it('loads analytics preference on mount', async () => {
    render(<AboutModal onClose={vi.fn()} />)
    // @ts-ignore
    await waitFor(() => { expect(window.api.getPreferences).toHaveBeenCalled() })
  })

  it('renders analytics toggle switch', async () => {
    render(<AboutModal onClose={vi.fn()} />)
    await waitFor(() => { expect(screen.getByRole('switch')).toBeInTheDocument() })
  })

  it('toggle has aria-label for accessibility', async () => {
    render(<AboutModal onClose={vi.fn()} />)
    await waitFor(() => { expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Anonymous usage statistics') })
  })

  it('displays analytics privacy text', async () => {
    render(<AboutModal onClose={vi.fn()} />)
    await waitFor(() => { expect(screen.getByText(/No personal data collected/)).toBeInTheDocument() })
  })

  it('has Learn more link for privacy', async () => {
    render(<AboutModal onClose={vi.fn()} />)
    await waitFor(() => {
      const link = screen.getByText('Privacy Policy')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '#')
    })
  })

  it('closes when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<AboutModal onClose={onClose} />)
    await waitFor(() => { expect(screen.getByTestId('about-close-button')).toBeInTheDocument() })
    await act(async () => { screen.getByTestId('about-close-button').click() })
    expect(onClose).toHaveBeenCalled()
  })
})
