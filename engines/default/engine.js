import utils from './utils.js'
import OpenAIWrapper from './OpenAIWrapper.js'
import config from './config.js'

/*
Good sample prompt

In my work I have observed that as the population of rabbits grows, their birth rate increases.  Likewise as the population of rabbits grows, their death rate also increases.  I have also seen that the more rabbits we have, the fewer resources there are, and when there are fewer resources, the birth rate goes down, and the death rate goes up.
*/

class Engine {
    constructor() {

    }

    additionalParameters()  {
        const models = [ 
            {label: "ChatGPT Latest - Best", value: 'chatgpt-4o-latest'}, 
            {label: "GPT-4o-mini Cheap", value: 'gpt-4o-mini'}, 
            {label: "o1-mini - New/Flaky", value: 'o1-mini'},
            {label: "o1-preview - New/Flaky", value: 'o1-preview'}, 
            {label: "o1 - Newest/Flaky", value: 'o1'}, 
        ];

        return [{
                name: "openAIKey",
                type: "string",
                required: true,
                uiElement: "password",
                saveForUser: "global",
                label: "Open AI API Key",
                description: "Leave blank for the default, or your Open AI key - skprojectXXXXX"
            },{
                name: "openAIModel",
                type: "string",
                defaultValue: config.defaultModel,
                required: false,
                options: models,
                uiElement: "combobox",
                saveForUser: "local",
                label: "Open AI Model",
                description: "The OpenAI model that you want to use to process your queries."
            },{
                name: "promptSchemeId",
                type: "string",
                defaultValue: config.defaultPromptSchemeId,
                required: false,
                options: Object.keys(utils.promptingSchemes).map(function(scheme) {
                    return {
                        label: scheme,
                        value: scheme,
                    };
                }),
                uiElement: "combobox",
                saveForUser: "local",
                label: "Prompt Scheme",
                description: "The collection of templates you want your queries to use.  These templates instruct the OpenAI model how to respond to your queries."
            },{
                name: "backgroundKnowledge",
                type: "string",
                required: false,
                uiElement: "textarea",
                saveForUser: "local",
                label: "Background Knowledge",
                description: "Background information you want the OpenAI model to consider when generating a diagram for you"
            }
        ];
    }

    async generate(prompt, currentModel, parameters) {
        const openAIModel = parameters.openAIModel;
        const promptSchemeId = parameters.promptSchemeId;
        const openAIKey = parameters.openAIKey;
        const backgroundKnowledge = parameters.backgroundKnowledge;

        try {
            let wrapper = new OpenAIWrapper(openAIModel, promptSchemeId, backgroundKnowledge, openAIKey);
            const relationships = await wrapper.generateDiagram(prompt, currentModel);
            const variables =  [...new Set([...relationships.map( e => e.start),...relationships.map( e => e.end )])];
            return {
                success: true,
                relationships: relationships,
                variables: variables
            };
        } catch(err) {
            console.error(err);
            return { 
                success: false, 
                err: err.toString() 
            };
        }
    }
}

export default Engine;