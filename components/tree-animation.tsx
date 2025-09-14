"use client";

import { motion } from "framer-motion";

export function TreeAnimation() {
  const treeVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 2,
        staggerChildren: 0.3,
      },
    },
  };

  const branchVariants = {
    hidden: {
      scaleY: 0,
      originY: 1,
    },
    visible: {
      scaleY: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  const leafVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.3,
      },
    },
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
      <motion.div
        className="relative w-64 h-80"
        variants={treeVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Trunk */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-32 bg-amber-800 rounded-t-lg"
          variants={branchVariants}
        />

        {/* Main branches */}
        <motion.div
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-6 h-24 bg-amber-700 rounded-t-lg rotate-12 origin-bottom"
          variants={branchVariants}
        />
        <motion.div
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-6 h-24 bg-amber-700 rounded-t-lg -rotate-12 origin-bottom"
          variants={branchVariants}
        />

        {/* Secondary branches */}
        <motion.div
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-4 h-16 bg-amber-600 rounded-t-lg rotate-24 origin-bottom"
          variants={branchVariants}
        />
        <motion.div
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-4 h-16 bg-amber-600 rounded-t-lg -rotate-24 origin-bottom"
          variants={branchVariants}
        />

        {/* Leaves */}
        <motion.div
          className="absolute top-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-green-500 rounded-full"
          variants={leafVariants}
        />
        <motion.div
          className="absolute top-16 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-green-600 rounded-full"
          variants={leafVariants}
        />
        <motion.div
          className="absolute top-24 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-700 rounded-full"
          variants={leafVariants}
        />

        {/* Side leaves */}
        <motion.div
          className="absolute top-12 left-1/2 w-12 h-12 bg-green-500 rounded-full -translate-x-20"
          variants={leafVariants}
        />
        <motion.div
          className="absolute top-12 left-1/2 w-12 h-12 bg-green-500 rounded-full translate-x-8"
          variants={leafVariants}
        />

        {/* Connection lines */}
        <motion.div
          className="absolute top-20 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-green-400"
          variants={branchVariants}
        />
        <motion.div
          className="absolute top-28 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-green-400"
          variants={branchVariants}
        />
      </motion.div>
    </div>
  );
}
