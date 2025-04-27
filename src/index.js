import readline from 'readline';
import PollsManager from './services/PollsManager.js';
import UserManager from './services/UserManager.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pollsManager = new PollsManager();
const userManager = new UserManager();

function mainMenu() {
  console.log("\n--- Poll Application ---");
  console.log("1. Create a new user");
  console.log("2. Create a new poll");
  console.log("3. Vote on a poll");
  console.log("4. Get poll results");
  console.log("5. List all polls");
  console.log("6. List polls created by a user");
  console.log("7. List polls a user has voted in");
  console.log("8. Delete a poll");
  console.log("9. Exit");
  rl.question("Select an option: ", (choice) => {
    switch (choice.trim()) {
      case '1':
        createUser();
        break;
      case '2':
        createPoll();
        break;
      case '3':
        votePoll();
        break;
      case '4':
        getResults();
        break;
      case '5':
        listAllPolls();
        break;
      case '6':
        listPollsByUser();
        break;
      case '7':
        listPollsVotedByUser();
        break;
      case '8':
        deletePoll();
        break;
      case '9':
        console.log("Goodbye!");
        rl.close();
        break;
      default:
        console.log("Invalid option. Please try again.");
        mainMenu();
        break;
    }
  });
}

function createUser() {
  rl.question("Enter a username: ", async (username) => {
    try {
      await userManager.createUser(username.trim());
      console.log(`User "${username}" created successfully.`);
    } catch (error) {
      console.error("Error creating user:", error.message);
    }
    mainMenu();
  });
}

function createPoll() {
  rl.question("Enter poll question (e.g., 'What is your favorite programming language?'): ", (question) => {
    rl.question("Enter poll options (comma separated, e.g., 'JavaScript, Python, Java'): ", (optionsInput) => {
      rl.question("Enter your username: ", async (username) => {
        try {
          const userExists = await userManager.userExists(username.trim());
          if (!userExists) {
            console.error(`User "${username}" does not exist. Please create the user first.`);
            return mainMenu();
          }

          const options = optionsInput.split(",").map(opt => opt.trim()).filter(opt => opt.length > 0);
          const poll = await pollsManager.createPoll(question, options, username.trim());
          console.log(`Poll created by ${username}, with ID: ${poll.uuid}`);
        } catch (error) {
          console.error("Error creating poll:", error.message);
        }
        mainMenu();
      });
    });
  });
}

function votePoll() {
  rl.question("Enter poll ID, option index, and username (comma separated, e.g., 'pollId,1,username'): ", async (input) => {
    const [pollId, optionIndex, username] = input.split(',').map(item => item.trim());
    try {
      const poll = await pollsManager.getPoll(pollId);
      if (!poll) {
        console.error(`Poll with ID "${pollId}" not found.`);
        return mainMenu();
      }

      if (!poll.options[optionIndex]) {
        console.error(`Invalid option index "${optionIndex}" for poll "${poll.question}".`);
        return mainMenu();
      }

      await pollsManager.vote(pollId, parseInt(optionIndex), username);
      console.log(`Vote recorded for option "${poll.options[optionIndex]}" by user "${username}".`);
    } catch (error) {
      console.error("Error voting:", error.message);
    }
    mainMenu();
  });
}

function getResults() {
  rl.question("Enter poll ID: ", async (pollId) => {
    try {
      const results = await pollsManager.getResults(pollId.trim());
      console.log("Poll Results:");
      console.log(`Question: ${results.question}`);
      console.log(`Total Votes: ${results.totalVotes}`);
      console.log("Results:");
      Object.entries(results.results).forEach(([option, votes]) => {
        console.log(`- ${option}: ${votes} votes`);
      });
    } catch (error) {
      console.error("Error retrieving poll results:", error.message);
    }
    mainMenu();
  });
}

function listAllPolls() {
  pollsManager.getPolls().then((polls) => {
    if (polls.length === 0) {
      console.log("No polls available.");
    } else {
      console.log("\n--- All Polls ---");
      polls.forEach(poll => {
        console.log(`Poll ID: ${poll.uuid}`);
        console.log(`Question: ${poll.question}`);
        console.log(`Options: ${poll.options.join(", ")}`);
        console.log(`Creator: ${poll.creator}`);
        console.log("--------------------");
      });
    }
    mainMenu();
  }).catch((error) => {
    console.error("Error listing polls:", error.message);
    mainMenu();
  });
}

function listPollsByUser() {
  rl.question("Enter username: ", async (username) => {
    try {
      const polls = await pollsManager.listPollsByCreator(username.trim());
      if (polls.length === 0) {
        console.log(`No polls found for user "${username}".`);
      } else {
        console.log(`\n--- Polls created by "${username}" ---`);
        polls.forEach(poll => {
          console.log(`Poll ID: ${poll.uuid}`);
          console.log(`Question: ${poll.question}`);
          console.log(`Options: ${poll.options.join(", ")}`);
          console.log("--------------------");
        });
      }
    } catch (error) {
      console.error("Error listing polls:", error.message);
    }
    mainMenu();
  });
}

function listPollsVotedByUser() {
  rl.question("Enter username: ", async (username) => {
    try {
      const polls = await pollsManager.listPollsVotedByUser(username.trim());
      if (polls.length === 0) {
        console.log(`No polls found that user "${username}" has voted in.`);
      } else {
        console.log(`\n--- Polls Voted by "${username}" ---`);
        polls.forEach(poll => {
          console.log(`Poll ID: ${poll.uuid}`);
          console.log(`Question: ${poll.question}`);
          console.log(`Options: ${poll.options.join(", ")}`);
          console.log("--------------------");
        });
      }
    } catch (error) {
      console.error("Error listing polls:", error.message);
    }
    mainMenu();
  });
}

function deletePoll() {
  rl.question("Enter poll ID to delete: ", (pollId) => {
    rl.question("Enter your username: ", async (username) => {
      try {
        await pollsManager.deletePoll(pollId.trim(), username.trim());
        console.log(`Poll with ID "${pollId}" deleted successfully.`);
      } catch (error) {
        console.error("Error deleting poll:", error.message);
      }
      mainMenu();
    });
  });
}

// Start the interactive prompt
mainMenu();
