<script lang="ts">
  import { Collapsible, Section } from '@dfinity/gix-components';
</script>

<div class="wrapper">
  <h1>FAQ</h1>

  <Section>
    <h2 slot="title">Why do we need Canister Dapps?</h2>
    <p>
      The <a
        href="https://internetcomputer.org"
        target="_blank"
        rel="noopener noreferrer">Internet Computer</a
      >
      is a versatile blockchain that allows for varying degrees of security, user
      privacy and ownership.
    </p>
    <p>
      For starters, it's a publicly governed blockchain with a 'liquid
      democracy'. Second, the security and authentication model of the IC
      together with
      <a
        href="https://identity.internetcomputer.org"
        target="_blank"
        rel="noopener noreferrer">Internet Identity</a
      >
      are ahead of legacy Web2 technology by default, giving users more control over
      their data and on-chain assets. For example, the
      <a
        href="https://internetcomputer.org/docs/references/icrc1-standard"
        target="_blank"
        rel="noopener noreferrer">ICRC-1</a
      >
      standard uses the IC's caller authentication model when sending funds. Furthermore,
      the ecosystem allows for
      <a
        href="https://wiki.internetcomputer.org/wiki/Service_Nervous_System"
        target="_blank"
        rel="noopener noreferrer">SNS DAOs</a
      > to give users more guarantees and ownership stake in certain projects.
    </p>
    <p>
      Despite these advantages, in practice it is still nearly impossible for
      non-technical users to be in full control of a single canister that runs
      their app.
    </p>
    <p>
      Canister Dapps allow non-technical users to create and fully own their
      decentralized applications. This allows for true decentralized software
      without any intermediaries.
    </p>
  </Section>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">What is a Canister Dapp?</h3>
      <p>
        A Canister Dapp is a decentralized application that runs on the <a
          href="https://internetcomputer.org"
          target="_blank"
          rel="noopener noreferrer">Internet Computer</a
        >. It is created by only using a browser and
        <a
          href="https://identity.internetcomputer.org"
          target="_blank"
          rel="noopener noreferrer">Internet Identity</a
        >
        and is only controlled by the user.
      </p>
    </Collapsible>
  </div>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">What is a Canister Dapp more technically?</h3>
      <p>
        A Canister Dapp is a single canister that functions as both a frontend
        server and a backend. It is controlled by the user's <a
          href="https://identity.internetcomputer.org"
          target="_blank"
          rel="noopener noreferrer">Internet Identity</a
        >
        principal derived at <code>canister_id.icp0.io</code>
      </p>
    </Collapsible>
  </div>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">How does it work?</h3>
      <p>
        A user can use a service like <a href="https://mycanister.app"
          >mycanister.app</a
        > to create a new canister with their own funds, install a Canister Dapp
        and be the sole controller. The user can use the Canister Dashboard to top-up
        their Dapp with cycles and perform other management tasks.
      </p>
    </Collapsible>
  </div>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">What are the challenges?</h3>
      <p>
        The end user is fully responsible for their Dapp. The framework needs to
        ensure security and protect against data loss, all without requiring the
        user to have technical knowledge.
      </p>
      <p>
        Dapps need an update mechanism with the right balance of convenience and
        security.
      </p>
    </Collapsible>
  </div>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">How decentralized is it really?</h3>
      <p>
        The domain icp0.io remains a central point of failure, which is inherent
        in the security model of <a
          href="https://identity.internetcomputer.org"
          target="_blank"
          rel="noopener noreferrer">Internet Identity</a
        >. In practice, Dapps in development rely on the developer to be
        maintained.
      </p>
      <p>
        Appart from this, a Canister Dapp lives on-chain and is at all times
        fully controlled by the user. A mature Dapp, for instance a secure <a
          href="https://wiki.internetcomputer.org/wiki/VetKD"
          target="_blank"
          rel="noopener noreferrer">vetKD</a
        > password manager, could be installed once and theoretically run for a very
        long time without any further updates, only cycle top-ups.
      </p>
    </Collapsible>
  </div>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">Who should use Canister Dapps?</h3>
      <p>
        Canister Dapps are meant for users who want to create their own
        decentralized applications with the guarantee that they are the only
        controller without any intermediaries. These users are typically
        blockchain enthusiasts, developers, or those who value privacy, security
        and ownership.
      </p>
    </Collapsible>
  </div>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">Does mycanister.app store user data?</h3>
      <p>
        No, mycanister.app does not store any user data. It's simply a static
        website. The platform is designed to give users full control over their
        decentralized applications without relying on an intermediary. The user
        will be able to run mycanister.app from their local computer if they
        wish.
      </p>
    </Collapsible>
  </div>

  <div class="faq-item">
    <Collapsible iconSize="medium">
      <h3 slot="header">
        How does mycanister.app remember my installed app history?
      </h3>
      <p>
        When you create a new canister, you deposit ICP to an account only you
        can access. The canister creation transaction is public. mycanister.app
        fetches that data from the Internet Computer.
      </p>
    </Collapsible>
  </div>
</div>

<style>
  .wrapper {
    padding: 1rem;
  }

  .faq-item {
    margin-bottom: 2rem;
    margin-top: 2rem;
  }
</style>
