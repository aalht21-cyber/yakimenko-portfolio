import Header from '../sections/Header'
import Hero from '../sections/Hero'
import Projects from '../sections/Projects'
import Services from '../sections/Services'
import WorkStyle from '../sections/WorkStyle'
import Process from '../sections/Process'
import Guarantees from '../sections/Guarantees'
import ContactsFooter from '../sections/ContactsFooter'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projects />
        <Services />
        <WorkStyle />
        <Process />
        <Guarantees />
        <ContactsFooter />
      </main>
    </>
  )
}
