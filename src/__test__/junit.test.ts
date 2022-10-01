import ts, { ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import path from 'path';
import { parseStdin } from '../junit';
import { loadConfig } from '../config';

function getDiagnosticResult() {
  const program = ts.createProgram([path.resolve(__dirname, '../__fixtures__/input.ts')], {
    noEmit: true,
    target: ScriptTarget.ESNext,
    module: ModuleKind.ESNext,
    allowJs: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
  });

  const emitResult = program.emit();
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  return ts.formatDiagnostics(allDiagnostics, {
    getCanonicalFileName: (path) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  });
}

it('correctly parses success', () => {
  const result = parseStdin('');

  expect(result.suites.length).toBe(1);
  expect(result.suites[0].testCases).toEqual([]);
});

it('uses config file with success', async () => {
  const config = await loadConfig('./src/__fixtures__/tsconfig.json');
  const result = parseStdin('', config);

  expect(result.suites.length).toBe(2);
  expect(result.suites[0].testCases).toEqual([]);
  expect(result.suites[1].testCases).toEqual([]);
});

it('correctly parses errors', () => {
  const stdin = getDiagnosticResult();
  const result = parseStdin(stdin);

  expect(result.suites.length).toBe(1);
  expect(result.suites[0].testCases).toBeDefined();
  expect(result.suites[0].testCases).toMatchObject([
    {
      name: 'src/__fixtures__/input.ts',
      classname: 'src/__fixtures__/input.ts:30:30',
      failures: [
        {
          type: 'TS2355',
          message: expect.any(String),
        },
      ],
    },
    {
      name: 'src/__fixtures__/input.ts',
      classname: 'src/__fixtures__/input.ts:3:3',
      failures: [
        {
          type: 'TS1308',
          message: expect.any(String),
        },
      ],
    },
    {
      name: 'src/__fixtures__/input.ts',
      classname: 'src/__fixtures__/input.ts:12:12',
      failures: [
        {
          type: 'TS2554',
          message: expect.any(String),
        },
      ],
    },
    {
      name: 'src/__fixtures__/input.ts',
      classname: 'src/__fixtures__/input.ts:11:11',
      failures: [
        {
          type: 'TS2554',
          message: expect.any(String),
        },
      ],
    },
  ]);
});

it('uses config file with errors', async () => {
  const config = await loadConfig('./src/__fixtures__/tsconfig.json');
  const result = parseStdin(getDiagnosticResult(), config);

  expect(result.suites.length).toBe(2);
  expect(result.suites[0].testCases).toHaveLength(4);
  expect(result.suites[1].testCases).toHaveLength(0);
});
