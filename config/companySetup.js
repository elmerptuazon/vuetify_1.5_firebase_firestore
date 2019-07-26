const fs = require('fs-extra');
const { exec } = require('child_process');
//check what company is Executed
// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
// });
// console.log(process.argv[2]);
function executeCommand(cmd) {
    return new Promise(function (resolve, reject) {
        exec(cmd, function (err, stdout) {
            if (err) {
                reject(err);
                return;
            }

            resolve(stdout);
        });
    });
}

(async function copyCompanySetUp() {
    try {
        let imgSource = `company_setup/${process.argv[2]}/src/assets`;
        let imgDestination = 'src/assets'
        await fs.copy(imgSource, imgDestination)
        console.log('Img assets update success!')

        let configSource = `company_setup/${process.argv[2]}/environmentConfig`;
        let configDestination = 'config'
        await fs.copy(configSource, configDestination)
        console.log('Environment Config update success!')

        let pageSource = `company_setup/${process.argv[2]}/src/pages`;
        let pageDestination = 'src/pages'
        await fs.copy(pageSource, pageDestination)
        console.log('Pages update success!')

        let componentSource = `company_setup/${process.argv[2]}/src/components`;
        let componentDestination = 'src/components'
        await fs.copy(componentSource, componentDestination)
        console.log('Components update success!')


        let moduleSource = `company_setup/${process.argv[2]}/src/store/modules`;
        let moduleDestination = 'src/store/modules'
        await fs.copy(moduleSource, moduleDestination)
        console.log('Store Modules update success!')

        let staticSource = `company_setup/${process.argv[2]}/static`;
        let staticgDestination = 'static'
        await fs.copy(staticSource, staticgDestination)
        console.log('Static files update success!')

        let indexSource = `company_setup/${process.argv[2]}/index/index.html`;
        let indexDestination = 'index.html'
        await fs.copy(indexSource, indexDestination)
        console.log('index.html update success!')
        console.log('building app')
        await executeCommand('npm run build');
        console.log('build success into dist');

    }
    catch (err) {
        console.error(err)
    }


})();

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

// module.exports.copyCompanySetUp = copyCompanySetUp;