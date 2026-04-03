import { calculateProjectFunding, calculateBidPayout } from '@/lib/db'

describe('Funding Calculations', () => {
  describe('calculateProjectFunding', () => {
    it('calculates project funding percentage correctly', () => {
      const result = calculateProjectFunding(5000, 10000)
      expect(result).toBe(50)
    })

    it('returns 100 for fully funded project', () => {
      const result = calculateProjectFunding(10000, 10000)
      expect(result).toBe(100)
    })

    it('handles zero goal', () => {
      const result = calculateProjectFunding(1000, 0)
      expect(result).toBe(0)
    })

    it('handles over-funded project', () => {
      const result = calculateProjectFunding(15000, 10000)
      expect(result).toBe(150)
    })
  })

  describe('calculateBidPayout', () => {
    it('calculates payout for winning bid', () => {
      const payout = calculateBidPayout(1000, 50, true)
      expect(payout).toBe(1500) // 1000 + (1000 * 0.5)
    })

    it('returns 0 for losing bid', () => {
      const payout = calculateBidPayout(1000, 50, false)
      expect(payout).toBe(0)
    })

    it('handles 100% risk multiplier', () => {
      const payout = calculateBidPayout(1000, 100, true)
      expect(payout).toBe(2000) // 1000 + (1000 * 1.0)
    })

    it('handles 0% risk multiplier', () => {
      const payout = calculateBidPayout(1000, 0, true)
      expect(payout).toBe(1000) // 1000 + (1000 * 0.0)
    })
  })
})
