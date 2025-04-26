import { motion } from 'framer-motion'

export default function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="h-screen bg-gradient-to-br from-cyan-700 to-blue-900 text-white flex items-center justify-center"
    >
      <h1 className="text-4xl font-bold">Framer-Lite Starter</h1>
    </motion.div>
  )
}
