# 🚀 GitHub Setup Guide — Buddies Project

> **Goal:** Get the Buddies project onto GitHub under the **AkshayChavhan** account, with all commits authored by AkshayChavhan, while keeping Cursor + Claude IDE working with the akshayvchavh Anthropic account.
>
> **Time required:** ~15 minutes

---

## 📋 What This Guide Covers

1. Create a new GitHub repository
2. Clone the empty repo locally
3. Find your AkshayChavhan email
4. Set commit author to AkshayChavhan
5. Authenticate git to push as AkshayChavhan
6. Test commit and push
7. Verify on GitHub

---

## ✅ Prerequisites

Before you begin, make sure you have:

- A computer with a terminal (Linux/Mac/WSL)
- **Git installed** — verify with `git --version`
- **A GitHub account** (`AkshayChavhan`) — you should be able to log in to [github.com](https://github.com)
- **An internet connection**

---

## Step 1 — Create the GitHub Repository

1. Open your browser and go to **[github.com](https://github.com)**

2. **Make sure you're logged in as `AkshayChavhan`**
   - Look at the top-right avatar
   - If you see the wrong account → click avatar → **Sign out** → sign back in as AkshayChavhan

3. Click the **`+`** icon in the top-right → **New repository**

   *Or go directly to* **[github.com/new](https://github.com/new)**

4. Fill in the form:

   | Field | Value |
   |---|---|
   | **Owner** | `AkshayChavhan` |
   | **Repository name** | `buddies` |
   | **Description** | `A trip planner mobile app for groups of friends. Built with React Native (Expo), Next.js, Prisma, and MongoDB.` |
   | **Visibility** | ✅ **Public** |
   | **Initialize with README** | ✅ Checked |
   | **Add .gitignore** | Choose **Node** |
   | **Choose a license** | **MIT License** |

5. Click **Create repository**

6. You should land on `https://github.com/AkshayChavhan/buddies` — copy this URL, you'll use it next.

---

## Step 2 — Clone the Repository Locally

1. Open your terminal

2. Navigate to wherever you keep your projects:

   ```bash
   cd ~/Documents/workspace
   ```

   *Adjust the path to wherever you want the project to live.*

3. Clone the repo:

   ```bash
   git clone https://github.com/AkshayChavhan/buddies.git
   ```

   > ⚠️ **If git asks for credentials right now and you enter the wrong ones, the clone will still work** (because the repo is public — no auth needed for cloning). Don't worry about it. We'll fix authentication for pushing in Step 5.

4. Move into the cloned folder:

   ```bash
   cd buddies
   ```

5. Verify everything is set up correctly:

   ```bash
   ls -la
   git remote -v
   ```

   You should see `README.md`, `LICENSE`, `.gitignore` files and the remote pointing to `https://github.com/AkshayChavhan/buddies.git`.

---

## Step 3 — Find Your AkshayChavhan Email

You need the email associated with your AkshayChavhan GitHub account so commits can be linked to it.

1. In your browser, **sign in to github.com as AkshayChavhan** (verify the avatar in the top-right)

2. Go to **[github.com/settings/emails](https://github.com/settings/emails)**

3. You'll see two options:

   ### Option A — Your real email
   Example: `akshay.chavhan@gmail.com`

   ### Option B — Your noreply (privacy) email
   Example: `12345678+AkshayChavhan@users.noreply.github.com`
   *Only available if **"Keep my email addresses private"** is checked.*

4. **Copy whichever email you want to use**

   > 💡 **Recommendation for a public portfolio repo:** Use the **noreply email** — it keeps your real email out of public commit history while still linking commits to your GitHub profile.
   >
   > To enable it: scroll down to **"Keep my email addresses private"** and check the box. Then copy the noreply email shown.

5. Save this email somewhere — you'll paste it in the next step.

---

## Step 4 — Set Commit Author to AkshayChavhan (For This Repo Only)

This makes every commit you make in the `buddies` folder show **AkshayChavhan** as the author — without affecting any other projects on your laptop.

1. Make sure you're inside the buddies folder:

   ```bash
   cd ~/Documents/workspace/buddies
   ```

2. Set the username:

   ```bash
   git config user.name "AkshayChavhan"
   ```

3. Set the email (paste the email you copied in Step 3):

   ```bash
   git config user.email "<paste-your-AkshayChavhan-email-here>"
   ```

   **Example with the noreply email:**
   ```bash
   git config user.email "12345678+AkshayChavhan@users.noreply.github.com"
   ```

4. **Verify the setup:**

   ```bash
   git config user.name
   git config user.email
   ```

   ✅ Both should print `AkshayChavhan` and the email you set.

> 📌 **Why `git config` and not `git config --global`?** Without `--global`, the setting applies **only** to this folder (this repo). Your other projects keep using your global git identity. This is the cleanest way to handle multiple GitHub accounts on one machine.

---

## Step 5 — Authenticate Git to Push as AkshayChavhan

Right now, git might still have cached credentials from the wrong account (`akshayvchavh`). We'll clear those and set up authentication via GitHub CLI — the cleanest method.

### 5.1 — Clear any old cached credentials

**On Linux:**
```bash
rm -f ~/.git-credentials
git credential-cache exit 2>/dev/null
```

**On Mac:**
```bash
printf "host=github.com\nprotocol=https\n\n" | git credential-osxkeychain erase
```

*Or open the **Keychain Access** app, search for `github.com`, and delete any entries.*

### 5.2 — Install GitHub CLI

```bash
# Ubuntu/Debian
sudo apt install gh

# Mac (with Homebrew)
brew install gh

# Verify
gh --version
```

If `gh --version` prints a version number, you're good.

### 5.3 — Logout of any existing GitHub CLI sessions

```bash
gh auth logout
```

If it says you're not logged in, that's fine — skip to next step.

If it asks which account, log out of all of them.

### 5.4 — Login as AkshayChavhan

```bash
gh auth login
```

Follow the prompts carefully:

| Prompt | Choose |
|---|---|
| Where do you use GitHub? | **GitHub.com** |
| Preferred protocol for Git operations? | **HTTPS** |
| Authenticate Git with your GitHub credentials? | **Yes** |
| How would you like to authenticate? | **Login with a web browser** |

The terminal will display a one-time code like `XXXX-XXXX`. **Copy it.**

A browser window opens (or you can manually visit the URL shown).

🚨 **CRITICAL — Before pasting the code:**
1. Look at the top-right of github.com in the browser
2. If the avatar shows **akshayvchavh** (or anyone other than AkshayChavhan):
   - Sign out
   - Sign in as **AkshayChavhan**
   - Then come back to the device-code page

3. Paste the code → click **Continue** → click **Authorize**

### 5.5 — Verify you're authenticated as the right account

```bash
gh auth status
```

You should see:
```
✓ Logged in to github.com account AkshayChavhan
```

If it shows `akshayvchavh` or the wrong account, run `gh auth logout` and redo Step 5.4.

---

## Step 6 — Test Commit and Push

Time to verify everything works end-to-end.

1. Make sure you're in the buddies folder:

   ```bash
   cd ~/Documents/workspace/buddies
   ```

2. Final sanity check — all four of these should show AkshayChavhan:

   ```bash
   git config user.name              # → AkshayChavhan
   git config user.email             # → AkshayChavhan's email
   gh auth status | grep account     # → AkshayChavhan
   git remote -v                     # → https://github.com/AkshayChavhan/buddies.git
   ```

3. If you've added project files (PROMPT.md, FUTURE_SCOPE.md, etc.), stage them:

   ```bash
   git add .
   ```

   *If you haven't added files yet, skip to "test commit" below.*

4. Make your first commit:

   ```bash
   git commit -m "chore: initial project structure and documentation"
   ```

   *If you have nothing to commit, do a quick test:*
   ```bash
   echo "" >> README.md
   git add README.md
   git commit -m "chore: verify commit author"
   ```

5. Push to GitHub:

   ```bash
   git push origin main
   ```

   ✅ Should succeed without prompting for credentials.

   ❌ If you see `403 Permission denied`:
   - Re-run `gh auth status` to verify the correct account
   - Make sure you're in the right folder (`pwd` should end in `buddies`)
   - Check `git remote -v` matches `AkshayChavhan/buddies`

---

## Step 7 — Verify on GitHub

1. Open `https://github.com/AkshayChavhan/buddies` in your browser

2. You should see your commit at the top of the file list

3. **Click on the commit message** (or the commit hash like `a1b2c3d`)

4. On the commit detail page:
   - The author should show **AkshayChavhan** with their avatar
   - The commit should be marked with a green **Verified** badge if you used the noreply email (or any verified email on your GitHub account)

✅ **Done.** Every future commit + push from this folder will be authored and pushed as AkshayChavhan.

---

## 🛡️ What Stays Unchanged

| Tool/Service | Account |
|---|---|
| **Cursor IDE login** | `akshayvchavh` (your Anthropic account) — UNCHANGED |
| **Claude inside Cursor** | Works as before — UNCHANGED |
| **Other projects on your laptop** | Use global git config — UNCHANGED |
| **The `buddies` folder ONLY** | Commits + pushes as AkshayChavhan |

The local git config you set in Step 4 is **scoped to the buddies folder only**. No other project is affected.

---

## 🩺 Troubleshooting

### "Permission denied (publickey)" or 403 errors

```bash
# Clear stale credentials and re-authenticate
gh auth logout
gh auth login          # follow Step 5.4 again
```

### Wrong author shown on a commit

For the most recent commit only:

```bash
git commit --amend --reset-author --no-edit
git push origin main --force-with-lease
```

### `gh: command not found` after installing

Try:
```bash
which gh
# If empty, restart terminal or:
source ~/.bashrc       # Linux
source ~/.zshrc        # Mac (zsh)
```

### Credentials still being prompted

Set git to remember:
```bash
git config --global credential.helper store
git push origin main   # enter once, will be cached
```

### "fatal: not a git repository"

You're not inside the buddies folder:
```bash
cd ~/Documents/workspace/buddies
```

### Repo name mismatch (`buddy` vs `buddies`)

If your repo is named `buddy` but you want `buddies`:

1. On github.com → repo Settings → rename to `buddies`
2. Locally:
   ```bash
   cd ~/Documents/workspace
   mv buddy buddies
   cd buddies
   git remote set-url origin https://github.com/AkshayChavhan/buddies.git
   ```

---

## 📝 Quick Reference (Copy-Paste Cheat Sheet)

```bash
# === ONE-TIME SETUP ===

# Step 2: Clone
cd ~/Documents/workspace
git clone https://github.com/AkshayChavhan/buddies.git
cd buddies

# Step 4: Set commit author (THIS repo only)
git config user.name "AkshayChavhan"
git config user.email "<your-AkshayChavhan-email>"

# Step 5: Authenticate
gh auth logout
gh auth login              # follow web prompts as AkshayChavhan
gh auth status             # verify

# === DAILY USE ===

# Make changes, then:
git add .
git commit -m "your message"
git push origin main
```

---

**🎉 You're all set!** Open the buddies folder in Cursor, start a Claude chat, and send:

> **"Read PROMPT.md and FUTURE_SCOPE.md. Then begin: Day 1, go."**

Happy building! 🧳
