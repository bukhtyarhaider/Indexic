# PRONTX Indexic

<div align="center">
 
  <p><strong>Premium Portfolio Management & Project Indexing Tool</strong></p>
  <img src="src/assets/logo.png" width="100" height="auto" alt="PRONTX Logo" />
</div>

PRONTX Indexic is a modern, high-performance web application designed to help developers and designers manage, showcase, and index their project portfolios. Built with a focus on aesthetics, speed, and usability, it offers a glassmorphic, dark-themed interface that feels premium and responsive.

## ✨ Features

- **🚀 Project Management**: Easily create, edit, duplicate, and delete projects.
- **📂 GitHub Integration**: Seamlessly import your repositories directly from GitHub with a single click.
- **📊 Smart Filtering**: Filter projects by **Category**, **Tags**, or search by name, stack, or owner.
- **💾 Data Portability**: Import and Export your entire project index as JSON. Move your data anywhere.
- **📱 Responsive Design**: Fully responsive UI that works perfectly on desktop, tablet, and mobile.
- **🎨 Premium Aesthetics**: Custom-built UI with Tailwind CSS v4, featuring glassmorphism, smooth animations, and a distinct "Ventura Capital" style.
- **🔒 Secure Architecture**: Client-side data management ensuring your local data stays local until you choose to share it.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) (TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: Heroicons & Custom SVG Assets
- **State Management**: React Context & Hooks

## 🚀 Getting Started

Follow these steps to get the project running locally on your machine.

### Prerequisites

- **Node.js**: Ensure you have Node.js (v18 or higher) installed.
- **npm** (or yarn/pnpm)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prontx-indexic.git
   cd prontx-indexic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components (ProjectCard, Modals, etc.)
├── context/        # React Context (ToastContext, etc.)
├── hooks/          # Custom Hooks (useProjects, useFilters)
├── pages/          # Main Page Views (Dashboard, AuthPage)
├── types/          # TypeScript Intefaces & Types
├── constants/      # Global Constants & Configuration
└── index.css       # Global Styles & Tailwind Configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by the PRONTX Team</p>
</div>
