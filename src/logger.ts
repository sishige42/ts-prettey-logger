import dotenv from 'dotenv';

/**
 * ログシステム(プレフィックス自動付与)
 * 必要に応じてログレベルの ON/OFF を調整可能
 */

// .env読み込み
dotenv.config();

// 設定
const IS_DEBUG: boolean = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
const ENABLE_ANSI: boolean = IS_DEBUG;

// ログレベル定義
type LogLevel = 'ERROR' | 'WARNING' | 'SUCCESS' | 'INFO' | 'DEBUG';

// 各ログレベルの表示制御(必要に応じて変更)
const LOG_LEVELS: Record<LogLevel, boolean> = {
  ERROR:   true,
  WARNING: true,
  SUCCESS: true,
  INFO:    true,
  DEBUG:   IS_DEBUG
} as const;

// ANSI escape sequence
const ANSI = {
  RESET:  '\x1b[0m',

  // color
  RED:    '\x1b[31m',
  GREEN:  '\x1b[32m',
  BLUE:   '\x1b[34m',
  YELLOW: '\x1b[33m',
  GRAY:   '\x1b[90m',

  // style
  BOLD:      '\x1b[1m',
  DIM:       '\x1b[2m',
  ITALIC:    '\x1b[3m',
  UNDERLINE: '\x1b[4m'
} as const;

// ログレベルと色の対応
const LOG_COLORS: Record<LogLevel, string> = {
  ERROR:   ANSI.RED,
  WARNING: ANSI.YELLOW,
  SUCCESS: ANSI.GREEN,
  INFO:    ANSI.BLUE,
  DEBUG:   ANSI.GRAY
} as const;

/**
 * プレフィックスを装飾する関数
 * [prefix] 全体をBOLD + COLOR にし、prefix部分をITALICにする
 * @param prefix - プレフィックス文字列
 * @param color - 色のANSIコード
 * @returns 装飾されたプレフィックス文字列
 */
function createStyledPrefix(prefix: string, color: string): string {
  if (!ENABLE_ANSI) {
    return `[${prefix}]`;
  }
  
  // [prefix] 全体をBOLD + COLOR、prefix部分をITALICにする
  return `${ANSI.BOLD}${color}[${ANSI.ITALIC}${prefix}${ANSI.RESET}${ANSI.BOLD}${color}]${ANSI.RESET}`;
}

/**
 * 共通ログ出力関数
 * @param level - ログレベル
 * @param message - ログメッセージ
 * @param args - 追加の引数
 */
function log(level: LogLevel, message: string, ...args: any[]): void {
  if (!LOG_LEVELS[level]) return;
  
  const prefix = createStyledPrefix(level, LOG_COLORS[level]);
  const output = `${prefix} ${message}`;
  
  // ERRORレベルのみconsole.errorを使用、その他はconsole.log
  if (level === 'ERROR') {
    console.error(output, ...args);
  } else {
    console.log(output, ...args);
  }
}

/**
 * ログレベルを部分適用した関数を作成
 * @param level - ログレベル
 * @returns ログ出力関数
 */
function createLogger(level: LogLevel) {
  return (message: string, ...args: any[]) => log(level, message, ...args);
}

// === 使用例とテスト ===
function testPrefixColors(): void {
  console.log('=== プレフィックス色付けテスト ===');
  
  logger.error('これはエラーメッセージです');
  logger.success('これは成功メッセージです');
  logger.info('これは情報メッセージです');
  logger.debug('これはデバッグメッセージです');
  logger.warn('これは警告メッセージです');
  
  console.log('\n=== 複数引数のテスト ===');
  logger.error('ファイルが見つかりません:', 'config.json');
  logger.success('処理完了。処理件数:', 42, '件');
  logger.debug('変数の値:', { user: 'test', id: 123 });
}

const logger = {
  error: createLogger('ERROR'),
  success: createLogger('SUCCESS'),
  info: createLogger('INFO'),
  debug: createLogger('DEBUG'),
  warn: createLogger('WARNING'),
  test: testPrefixColors
};

export default logger;
