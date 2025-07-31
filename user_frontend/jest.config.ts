import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({

    dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
    coverageProvider: 'babel',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)$': 'babel-jest',
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],


}

export default createJestConfig(config)