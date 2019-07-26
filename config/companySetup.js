const fs = require('fs-extra');
const { exec } = require('child_process');
//check what company is Executed
// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
// });
// console.log(value);
// function executeCommand(cmd) {
//     return new Promise(function (resolve, reject) {
//         exec(cmd, function (err, stdout) {
//             if (err) {
//                 console.log(err);
//                 reject(err);
//                 return;
//             }
//             console.log(stdout);
//             resolve(stdout);
//         });
//     });
// }

async function copyCompanySetUp(value) {
    try {
        console.log(value);
        let imgSource = `company_setup/${value}/src/assets`;
        let imgDestination = 'src/assets'
        await fs.copy(imgSource, imgDestination)
        console.log('Img assets update success!')

        let configSource = `company_setup/${value}/environmentConfig`;
        let configDestination = 'config'
        await fs.copy(configSource, configDestination)
        console.log('Environment Config update success!')

        try {
            let pageSource = `company_setup/${value}/src/pages`;
            let pageDestination = 'src/pages'
            await fs.copy(pageSource, pageDestination)
            console.log('Pages update success!')
        } catch (e) {
            console.log(`Error: ${e}`);
        }
        try {
            let componentSource = `company_setup/${value}/src/components`;
            let componentDestination = 'src/components'
            await fs.copy(componentSource, componentDestination)
            console.log('Components update success!')
        } catch (e) {
            console.log(`Error: ${e}`);
        }
        try {
            let moduleSource = `company_setup/${value}/src/store/modules`;
            let moduleDestination = 'src/store/modules'
            await fs.copy(moduleSource, moduleDestination)
            console.log('Store Modules update success!')
        } catch (e) {
            console.log(`Error: ${e}`);
        }

        let staticSource = `company_setup/${value}/static`;
        let staticgDestination = 'static'
        await fs.copy(staticSource, staticgDestination)
        console.log('Static files update success!')

        let indexSource = `company_setup/${value}/index/index.html`;
        let indexDestination = 'index.html'
        await fs.copy(indexSource, indexDestination)
        console.log('index.html update success!')
        // console.log('building app')

        // await executeCommand('node build/build.js');
        // console.log('build success into dist');

    }
    catch (err) {
        console.error(err)
    }


};

//update the sources depending on the company

// (async function copyCompanySetUp() {

//     const answer = await prompts({
//         type: 'select',
//         name: 'value',
//         message: 'Pick a company to SetUp',
//         choices: [
//             { title: 'Ever Bilena', value: 'EverBilena' },
//             { title: 'Barapido', value: 'Barapido' },
//             { title: 'Mary Kay', value: 'MaryKay', disabled: true },
//             { title: 'My Natural', value: 'MyNatural', disabled: true }
//         ],
//         initial: 0
//     }
//     );

//     try {
//         let imgSource = `company_setup/${answer.value}/src/assets`;
//         let imgDestination = 'src/assets'
//         await fs.copy(imgSource, imgDestination)
//         console.log('Img assets update success!')

//         let configSource = `company_setup/${answer.value}/environmentConfig`;
//         let configDestination = 'config'
//         await fs.copy(configSource, configDestination)
//         console.log('Environment Config update success!')

//         let pageSource = `company_setup/${answer.value}/src/pages`;
//         let pageDestination = 'src/pages'
//         await fs.copy(pageSource, pageDestination)
//         console.log('Pages update success!')

//         let componentSource = `company_setup/${answer.value}/src/components`;
//         let componentDestination = 'src/components'
//         await fs.copy(componentSource, componentDestination)
//         console.log('Components update success!')


//         let moduleSource = `company_setup/${answer.value}/src/store/modules`;
//         let moduleDestination = 'src/store/modules'
//         await fs.copy(moduleSource, moduleDestination)
//         console.log('Store Modules update success!')

//         let staticSource = `company_setup/${answer.value}/static`;
//         let staticgDestination = 'static'
//         await fs.copy(staticSource, staticgDestination)
//         console.log('Static files update success!')

//         let indexSource = `company_setup/${answer.value}/index/index.html`;
//         let indexDestination = 'index.html'
//         await fs.copy(indexSource, indexDestination)
//         console.log('index.html update success!')


//     }
//     catch (err) {
//         console.error(err)
//     }





//     //return true;
// })();

module.exports.copyCompanySetUp = copyCompanySetUp;