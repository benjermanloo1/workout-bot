<div align="center">
  <img src="assets/logo.png">
  
  <p align="center">
    <strong>lil discord bot </strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Discord.js-v14-blue?style=flat&logo=discord" alt="Discord.js">
    <img src="https://img.shields.io/badge/Node.js-v22+-green?style=flat&logo=node.js" alt="Node.js">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat" alt="License">
  </p>
</div>

## 🚀 Features

### 🔥 **Daily Streak Tracking**
- Maintain your fitness momentum with daily check-ins
- Streak reset at midnight if not checked in

### 💪 **Workout Management**
- Create and store custom workout splits
- Log detailed workout sessions with exercises, sets, and reps

### 🏆 **Personal Records**
- Track your maximum lifts across different exercises
- Automatic PR detection and celebration

### 📊 **Nutrition Support**
- Built-in maintenance calorie calculator
- Personalized recommendations based on your stats

## 🛠️ Installation

### Prerequisites
- Node.js v22 or higher
- Discord application with bot token
- Discord server with appropriate permissions

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/benjermanloo1/workout-bot.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   mv config-example.json config.json
   ```
   
   Edit `config.json` with your configuration:
   ```config
   {
     "token": "INSERT TOKEN HERE",
     "clientId": "INSERT CLIENT ID HERE",
     "guildId": "INSERT GUILD ID HERE"
   }
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

## 🎯 Commands

### All Users
| Command | Description |
|---------|-------------|
| `/add-workout` | Add a workout |
| `/checkin` | Daily check-in |
| `/delete-max` | Delete a max |
| `/delete-workout` | Delete a workout |
| `/edit-workout` | Edit a workout |
| `/leaderboard` | View the leaderboard |
| `/maintenance` | Calculate maintenance calories |
| `/max` | Record new max lift |
| `/server` | Provide information about server |

### Admin-only (debugging purposes)
| Command | Description |
|---------|-------------|
| `/reload` | Reload a command |
| `/reset` | Reset streak |

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/267e155e-2846-42e2-b96e-d247bb1f2f28" alt="User Info" width="400">
  <img src="https://github.com/user-attachments/assets/64e12462-087b-4d9c-8e0c-d87297367b9d" alt="Leaderboard" width="400">
</div>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Discord.js](https://discord.js.org/#/docs/discord.js/stable/general/welcome)
- [Discord Developer Portal](https://discord.com/developers/applications)

---
