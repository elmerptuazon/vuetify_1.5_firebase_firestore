const fs = require('fs-extra');
//const path = require('path');
//const Confirm = require('prompt-confirm');
const prompts = require('prompts');

//clean files
// (async function cleanUp() {
//     await fs.remove('res/icon');
//     await fs.remove('res/screen');
// })();


//check what company is Executed
// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
// });
// console.log();
//update the sources depending on the company

(async function copyCompanySetUp() {

    const answer = await prompts({
        type: 'select',
        name: 'value',
        message: 'Pick a company to SetUp',
        choices: [
            { title: 'Ever Bilena', value: 'EverBilena' },
            { title: 'Barapido', value: 'Barapido' },
            { title: 'Mary Kay', value: 'MaryKay', disabled: true },
            { title: 'My Natural', value: 'MyNatural', disabled: true }
        ],
        initial: 0
    }
    );

    try {
        let imgSource = `company_setup/${answer.value}/src/assets`;
        let imgDestination = 'src/assets'
        await fs.copy(imgSource, imgDestination)
        console.log('Img assets update success!')

        let configSource = `company_setup/${answer.value}/environmentConfig`;
        let configDestination = 'config'
        await fs.copy(configSource, configDestination)
        console.log('Environment Config update success!')

        try {
            let pageSource = `company_setup/${answer.value}/src/pages`;
            let pageDestination = 'src/pages'
            await fs.copy(pageSource, pageDestination)
            console.log('Pages update success!')
        } catch (e) {
            console.log(`Error: ${e}`);
        }
        try {
            let componentSource = `company_setup/${answer.value}/src/components`;
            let componentDestination = 'src/components'
            await fs.copy(componentSource, componentDestination)
            console.log('Components update success!')
        } catch (e) {
            console.log(`Error: ${e}`);
        }
        try {
            let moduleSource = `company_setup/${answer.value}/src/store`;
            let moduleDestination = 'src/store'
            await fs.copy(moduleSource, moduleDestination)
            console.log('Store Modules update success!')
        } catch (e) {
            console.log(`Error: ${e}`);
        }

        let staticSource = `company_setup/${answer.value}/static`;
        let staticgDestination = 'static'
        await fs.copy(staticSource, staticgDestination)
        console.log('Static files update success!')

        let indexSource = `company_setup/${answer.value}/index/index.html`;
        let indexDestination = 'index.html'
        await fs.copy(indexSource, indexDestination)
        console.log('index.html update success!')


    }
    catch (err) {
        console.error(err)
    }





    //return true;
})();

// module.exports.copyCompanySetUp = copyCompanySetUp;