import fs from "fs";
import path from "path";
import { Block, IfStatement, Project, SyntaxKind } from 'ts-morph';

const LOG_MARK = "[TS_LOG_INSERT_TOOL]";

// 创建一个ts-morph项目
const project = new Project();

// 获取指定目录下的所有.ts文件
function getTsFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getTsFiles(file));
        } else if (path.extname(file) === '.ts') {
            results.push(file);
        }
    });
    return results;
}


function insertLog(file: string, granularity : number = 0) {
    const sourceFile = project.addSourceFileAtPath(file);
    const fileName = path.basename(file);
    // 在所有函数和方法的开始处、结束处插入console.log
    sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.FunctionDeclaration || node.getKind() === SyntaxKind.MethodDeclaration) {
            const func = node as any;
            const name = func.getName();
            const body = func.getBody();
            if (body) {
                body.insertStatements(0, `console.log("${LOG_MARK} Enter ${fileName}: ${name}");`);
                if (granularity > 0) {
                    // 根据颗粒度和方法行数，插入更多的日志，以便更精确的定位到问题
                    let logIndex = 1;
                    const statements = body.getStatements();
                    const statementCount = statements.length;
                    const step = granularity;
                    let count = 0;
                    for (let i = 0; i < statementCount; i += step) {
                        body.insertStatements(i + logIndex, `console.log("${LOG_MARK} In ${fileName}: ${name} count: ${count}");`);
                        count++;
                        logIndex++;
                    }
                }
                body.addStatements(`console.log("${LOG_MARK} Leave ${fileName}: ${name}");`);
            }
        }
    });

    sourceFile.saveSync();
}


// 指定要处理的目录
//const dir = 'D:/ProjectBag/Debug/ts_files';
//getTsFiles(dir).forEach(file => insertLog(file,5));

//清除所有带有 LOG_MARK字符串 的日志语句
// getTsFiles(dir).forEach(file => {
//     const sourceFile = project.addSourceFileAtPath(file);
//     sourceFile.forEachDescendant(node => {
//         if (node.getKind() === SyntaxKind.ExpressionStatement) {
//             const expression = node as any;
//             const text = expression.getText();
//             if (text.indexOf(LOG_MARK) >= 0) {
//                 expression.remove();
//             }
//         }
//     });
//     sourceFile.saveSync();
// });


// 使用命令行参数指定要处理的文件夹路径；
// 使用命令行参数指定颗粒度，即每个方法插入日志的行数；
// 使用命令行参数指定是否清除日志，如果指定了清除日志，则不插入日志，只清除日志；

// 例如：
// npm run start D:/ProjectBag/Debug/ts_files 5
// npm run start D:/ProjectBag/Debug/ts_files 0 clear
// npm run start D:/ProjectBag/Debug/ts_files 5 clear
// npm run start D:/ProjectBag/Debug/ts_files 0
// npm run start D:/ProjectBag/Debug/ts_files

const args = process.argv.slice(2);
const dirArg = args[0];
const granularityArg = args[1];
const clearArg = args[2];

if (dirArg) {
    const dir = dirArg;
    if (clearArg) {
        getTsFiles(dir).forEach(file => {
            const sourceFile = project.addSourceFileAtPath(file);
            sourceFile.forEachDescendant(node => {
                if (node.getKind() === SyntaxKind.ExpressionStatement) {
                    const expression = node as any;
                    const text = expression.getText();
                    if (text.indexOf(LOG_MARK) >= 0) {
                        expression.remove();
                    }
                }
            });
            sourceFile.saveSync();
        });
    } else {
        const granularity = granularityArg ? parseInt(granularityArg) : 0;
        getTsFiles(dir).forEach(file => insertLog(file, granularity));
    }
} else {
    console.log("Please specify a directory path.");
}
