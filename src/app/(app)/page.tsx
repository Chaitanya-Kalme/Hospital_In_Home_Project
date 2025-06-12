'use client'
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { LampContainer } from "@/components/ui/lamp";

const words = `Connect with trusted doctors anytime, anywhere. Receive expert consultations, personalized treatment plans, and continuous care—all from the comfort of your home.`


export default function HomePage() {
  return (
    <div>

      <HeroHighlight>
        <motion.h1
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: [20, -5, 0],
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
        >
          With Hospital in Home Application you can contact the {" "}
          <Highlight className="text-black dark:text-white">
            Best Doctors Across the Globe
          </Highlight>
          {" "}Take their help and Get well soon
        </motion.h1>
      </HeroHighlight>
      
      <LampContainer>
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl w-80"
        >
          <TextGenerateEffect words={words}/>
        </motion.h1>
      </LampContainer>
    </div>

  )
}