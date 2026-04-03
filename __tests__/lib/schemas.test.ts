import { projectSchema, bidSchema } from '@/lib/schemas'

describe('Schema Validation', () => {
  describe('projectSchema', () => {
    it('validates valid project data', () => {
      const validProject = {
        title: 'Test Project',
        description: 'A test project',
        repositoryUrl: 'https://github.com/user/repo',
        fundingGoal: 10000,
      }
      const result = projectSchema.safeParse(validProject)
      expect(result.success).toBe(true)
    })

    it('rejects project with missing title', () => {
      const invalidProject = {
        description: 'A test project',
        repositoryUrl: 'https://github.com/user/repo',
        fundingGoal: 10000,
      }
      const result = projectSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
    })

    it('rejects project with invalid funding goal', () => {
      const invalidProject = {
        title: 'Test Project',
        description: 'A test project',
        repositoryUrl: 'https://github.com/user/repo',
        fundingGoal: -1000, // Negative goal
      }
      const result = projectSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
    })

    it('rejects project with short title', () => {
      const invalidProject = {
        title: 'Ab', // Too short
        description: 'A test project',
        repositoryUrl: 'https://github.com/user/repo',
        fundingGoal: 10000,
      }
      const result = projectSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
    })
  })

  describe('bidSchema', () => {
    it('validates valid bid data', () => {
      const validBid = {
        projectId: 'proj-123',
        amount: 1000,
        riskPercent: 50,
        prediction: 'YES',
      }
      const result = bidSchema.safeParse(validBid)
      expect(result.success).toBe(true)
    })

    it('rejects bid with invalid amount', () => {
      const invalidBid = {
        projectId: 'proj-123',
        amount: -1000,
        riskPercent: 50,
        prediction: 'YES',
      }
      const result = bidSchema.safeParse(invalidBid)
      expect(result.success).toBe(false)
    })

    it('rejects bid with invalid risk percent', () => {
      const invalidBid = {
        projectId: 'proj-123',
        amount: 1000,
        riskPercent: 150, // Over 100
        prediction: 'YES',
      }
      const result = bidSchema.safeParse(invalidBid)
      expect(result.success).toBe(false)
    })

    it('rejects bid with invalid prediction', () => {
      const invalidBid = {
        projectId: 'proj-123',
        amount: 1000,
        riskPercent: 50,
        prediction: 'MAYBE', // Invalid prediction
      }
      const result = bidSchema.safeParse(invalidBid)
      expect(result.success).toBe(false)
    })
  })
})
