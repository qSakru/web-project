```mermaid
flowchart LR
    subgraph StudentDevice["Asiakkaan laite"]
        UserInterface["Elokuvasovelluksen käyttöliittymä"]
    end

    subgraph ServiceEnvironment["Palveluympäristö"]
        RegistryService["Rekisteri"]
    end

    UserInterface <-->|"Verkkoyhteys"| RegistryService
```