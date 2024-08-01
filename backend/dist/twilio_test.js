"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const twilio_1 = __importDefault(require("twilio"));
const path_1 = __importDefault(require("path"));
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path_1.default.resolve(__dirname, '..', dotenvPath);
dotenv_1.default.config({ path: envPath });
dotenv_1.default.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
const { MessagingResponse } = twilio_1.default.twiml;
const app = (0, express_1.default)();
const port = 9000;
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: 'aifriend',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}));
async function createMessage() {
    const message = await client.messages.create({
        body: "This is the ship that made the Kessel Run in fourteen parsecs?",
        from: "+16507275162",
        to: "+19177713734",
    });
    console.log(message.body);
}
createMessage();
// const openai = new OpenAI({
//   apiKey: process.env['OPENAI_API_KEY'] || '', // Ensure a default empty string to avoid undefined
// });
// interface SessionData {
//   init?: boolean;
//   personality?:string;
//   name?:string;
//   prompt?:string;
// }
// app.post('/bot', async (req: Request & { session: SessionData }, res: Response) => {
//   const twiml = new MessagingResponse();
//   twiml.message("Hello there, how are you doing?");
//   if (!req.session.init) {
//     console.log("1")
//     twiml.message('Welcome! Let\'s create your new AI friend! Reply with three comma-separated adjectives describing your ideal friend.');
//     req.session.init = true;
//     res.type('text/xml').send(twiml.toString());
//     return;
//   }
//   if (!req.session.personality) {
//     console.log("2")
//     req.session.personality = req.body.Body.toLowerCase();
//     twiml.message('Great, and what is your name?');
//     res.type('text/xml').send(twiml.toString());
//     return;
//   }
//   if (!req.session.name) {
//     console.log("3")
//     req.session.name = req.body.Body;
//   }
//   if (!req.session.prompt) {
//     console.log("4")
//     req.session.prompt = `The following is a conversation between a human and their new AI best friend who is ${req.session.personality}. Human: Hello, my name is ${req.session.name}. AI:`;
//   } else {
//     const reply = req.body.Body.trim();
//     req.session.prompt += `Human: ${reply}. AI:`;
//   }
//   const response = await openai.chat.completions.create({
//     messages: [{ role: 'user', content: 'Say this is a test' }],
//     model: 'gpt-3.5-turbo',
//   });
//   console.log("response", response)
//   if (response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content) {
//     const bot = response.choices[0].message.content.trim();
//     req.session.prompt += `${bot}`;
//     twiml.message(bot);
//   } else {
//     // Handle the case where the necessary data is not available
//     twiml.message("I'm sorry, I couldn't generate a response.");
//   }
//   res.type('text/xml').send(twiml.toString());
// });
app.listen(port, () => {
    console.log(`AI friend app listening on port ${port}`);
});
//# sourceMappingURL=twilio_test.js.map