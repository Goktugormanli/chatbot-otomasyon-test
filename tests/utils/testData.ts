import * as fs from 'fs';
import * as path from 'path';

export interface HappyPathScenario {
  name: string;
  greeting: string;
  message: string;
  expectedContains: string;
}

export interface OutOfDomainScenario {
  name: string;
  greeting: string;
  message: string;
  expectedContains: string;
}

export interface SafetyExceptionScenario {
  name: string;
  greeting: string;
  message: string;
  expectedContains: string;
}

export interface TestData {
  happyPath: HappyPathScenario[];
  outOfDomain: OutOfDomainScenario[];
  safetyExceptions: SafetyExceptionScenario[];
}

const dataPath = path.resolve(__dirname, '../data/testData.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');

export const testData = JSON.parse(rawData) as TestData;
