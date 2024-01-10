
set /p ProjectName=Enter Project Name:
set /p AuthorName=Enter Author Name:
::Create the project folder
mkdir %ProjectName%

cd %ProjectName%
::call tsc --init
::call npm init -y

::Create the tsconfig.json file
echo { > tsconfig.json
echo     "compilerOptions": { >> tsconfig.json
echo         "target": "es2016", >> tsconfig.json
echo         "module": "commonjs", >> tsconfig.json
echo         "outDir": "./dist", >> tsconfig.json
echo         "rootDir": "./src", >> tsconfig.json
echo         "strict": true, >> tsconfig.json
echo         "esModuleInterop": true, >> tsconfig.json
echo         "forceConsistentCasingInFileNames": true, >> tsconfig.json
echo         "skipLibCheck": true >> tsconfig.json
echo     } >> tsconfig.json
echo } >> tsconfig.json

::Create the package.json file
echo { > package.json
echo     "name": "%ProjectName%", >> package.json
echo     "version": "1.0.0", >> package.json
echo     "description": "", >> package.json
echo     "main": "index.js", >> package.json
echo     "scripts": { >> package.json
echo         "build": "tsc -b", >> package.json
echo         "start": "node dist/index.js", >> package.json
echo         "test": "echo \"Error: no test specified\" && exit 1" >> package.json
echo     }, >> package.json
echo     "keywords": [], >> package.json
echo     "author": "%AuthorName%", >> package.json
echo     "license": "ISC" >> package.json
echo } >> package.json

::Create the src & dist folder
mkdir src
mkdir dist
::Create the index.ts file
cd src
echo. > index.ts
echo console.log("Hello World"); >> index.ts
cd ..
call npm run build
call npm run start 

