import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrutalButton } from '@/components/ui/BrutalButton'

describe('BrutalButton Component', () => {
  it('renders button with text', () => {
    render(<BrutalButton>Click Me</BrutalButton>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<BrutalButton>Submit</BrutalButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('brutal-button')
  })

  it('applies secondary variant class', () => {
    render(<BrutalButton variant="secondary">Cancel</BrutalButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('brutal-button')
  })

  it('applies danger variant class', () => {
    render(<BrutalButton variant="danger">Delete</BrutalButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('brutal-button')
  })

  it('applies size classes correctly', () => {
    const { container: smallContainer } = render(
      <BrutalButton size="sm">Small</BrutalButton>
    )
    const smallButton = smallContainer.querySelector('button')
    expect(smallButton).toHaveClass('px-4', 'py-2', 'text-sm')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<BrutalButton onClick={handleClick}>Click</BrutalButton>)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<BrutalButton disabled>Disabled</BrutalButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<BrutalButton className="custom-class">Custom</BrutalButton>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})
