# MediChat – AI-Powered Healthcare Assistant

MediChat is an AI-powered healthcare assistant built with **Next.js**, designed to provide personalized health support.  
It combines **secure authentication, intelligent chatbot interactions, and health data tracking** to act as a reliable digital healthcare companion.

---
<div align="center">
    <img src="/demo-photos/screencapture1.png" width="250px"/> 
</div>


## Key Features

- **Secure Authentication**  
  Login with Google/GitHub using **NextAuth** and JWT-based session management.

- **AI-Powered Chatbot**  
  Integrated with **Gemini AI** for context-aware health guidance and real-time responses.

- **Symptom Checker**  
  Enter symptoms → get probable conditions + recommended next steps (self-care or doctor visit).

- **Health Metrics Dashboard**  
  Track vitals like **Blood Pressure, Blood Sugar, Weight, and Medication History**.  
  Interactive charts powered by **Chart.js** and **Recharts**.

- **Medication Reminders** *(beta)*  
  Receive reminders and notifications for scheduled medications.

- **Data Security & Privacy**  
  TLS/SSL encryption, MongoDB (with Mongoose) for secure data storage, and role-based access control.

---

## Tech Stack

**Frontend:** Typescript, Next.js, Tailwind CSS  
**Backend:** Node.js, NextAuth, MongoDB + Mongoose  
**AI:** Gemini AI  
**Visualization:** Chart.js, Recharts  
**Security:** TLS/SSL, JWT  


## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/super-phantom91/Medichat-AI-Healthcare-Assistant.git
cd medichat
npm install
