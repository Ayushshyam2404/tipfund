import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge Component', () => {
  it('renders badge with text', () => {
    render(<Badge>Success</Badge>)
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('applies success variant class', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    const badge = container.querySelector('[class*="success"]')
    expect(badge).toBeInTheDocument()
  })

  it('applies danger variant class', () => {
    const { container } = render(<Badge variant="danger">Error</Badge>)
    const badge = container.querySelector('[class*="danger"]')
    expect(badge).toBeInTheDocument()
  })

  it('applies warning variant class', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>)
    const badge = container.querySelector('[class*="warning"]')
    expect(badge).toBeInTheDocument()
  })

  it('applies info variant class', () => {
    const { container } = render(<Badge variant="info">Info</Badge>)
    const badge = container.querySelector('[class*="info"]')
    expect(badge).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Badge className="custom-class">Custom</Badge>
    )
    const badge = container.firstChild
    expect(badge).toHaveClass('custom-class')
  })
})
