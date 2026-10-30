# Tekninen määrittely
## Elokuvanharrastajien ryhmäsovellus

### 1. Yleiskuvaus
Verkkosovellus, jossa käyttäjät voivat muodostaa ryhmiä, jakaa ja arvostella elokuvia (julkisesti tai ryhmän sisäisesti), keskustella sekä ylläpitää toivelistoja. Sovellus toimii myös ilman kirjautumista (rajoitetusti).

### 2. Tekniset osat
- **Frontend:** React  
- **Backend:** Express  
- **Tietokanta:** PostgreSQL  
- **Versionhallinta:** GitHub  
- **Hosting:** Azure (App Service / Container Apps + Azure Database for PostgreSQL)

### 3. Arkkitehtuuri
- **Frontend (React):** Käyttöliittymä, haku, kirjautuminen, ryhmä- ja elokuvanäkymät. Responsiivinen.
- **Backend (Express):** REST API. Käsittelee autentikoinnin, ryhmät, arvostelut, listat, keskustelut ja haun.
- **Tietokanta (PostgreSQL):** Käyttäjät, ryhmät, elokuvat, arvostelut, listat, viestit.
- **Ulkoiset palvelut:** TMDB (elokuvatiedot), Tulevat elokuvat (esim. Finnkino).
- **Azure + GitHub:** Hosting ja CI/CD.

### 4. Tärkeimmät toiminnallisuudet
- Etusivu elokuvilla + monipuolinen haku (ehdotukset)
- Ryhmien luonti, ylläpito ja jäsenhyväksyntä
- Arvostelut (1–5 tähteä + teksti) julkisesti tai ryhmässä
- Toivelistat ja klassikkolistat (jaettavissa linkillä)
- Keskustelu ryhmässä
- Kirjautuminen / rekisteröityminen (käyttäjätunnus + salasana)
- Törkyviestien moderointi
- Suomenkielinen käyttöliittymä (Enkku/Ruotsi ehkä)

### 5. Tietoturva
- Ryhmien yksityisyys ja jäsenhyväksyntä
- Perus-input-validointi ja suojaus injectionia vastaan???

### 6. Ulkoiset integraatiot
- **TMDB API:** Elokuvien perustiedot ja haku
- **Finnkino API** (ehkä): Teatteritarjonta

**KESKENERÄINEN FLOWCHART**

```mermaid
flowchart TB
    %% Käyttäjät
    subgraph Users["Käyttäjät"]
        Guest["Vierailija<br/>(ei kirjautunut)"]
        User["Kirjautunut käyttäjä"]
        Admin["Ryhmän ylläpitäjä"]
    end

    %% Frontend
    subgraph Frontend["Frontend – React"]
        direction TB
        UI["React-sovellus<br/>• Responsiivinen<br/>• Suomi (+Enkku/Ruotsi?)<br/>• Haku + ehdotukset<br/>• Etusivu, ryhmät, listat"]
        AuthUI["Kirjautuminen / Rekisteröityminen"]
        GroupUI["Ryhmänäkymät<br/>• Keskustelu<br/>• Arvostelut<br/>• Jäsenhyväksynnät"]
        MovieUI["Elokuvanäkymät<br/>• Arvostelut (1–5★ + teksti)<br/>• Toivelista<br/>• Klassikkolistat<br/>• Jakolinkit"]
    end

    %% Backend
    subgraph Backend["Backend – Express"]
        direction TB
        API["Express API<br/>(REST)"]
        Auth["Autentikointi<br/>(???)"]
        GroupService["Ryhmäpalvelu<br/>• Luonti, ylläpito<br/>• Liittymispyynnöt + hyväksyntä<br/>• Keskustelu / viestit"]
        ReviewService["Arvostelu- & Listapalvelu<br/>• Julkiset & ryhmän sisäiset arvostelut<br/>• Toivelistat & klassikot<br/>• Muokkaus"]
        SearchService["Hakupalvelu<br/>• Nimi, vuosi, ehdotukset"]
        Moderation["Moderointi<br/>• Törkyviestien poisto"]
        Recommend["Suosittelu & Tilastot<br/>(COULD)"]
    end

    %% Tietokanta
    subgraph Database["Tietokanta – PostgreSQL"]
        UsersDB[(Käyttäjät)]
        GroupsDB[(Ryhmät + jäsenet)]
        MoviesDB[(Elokuvat + metatiedot)]
        ReviewsDB[(Arvostelut)]
        ListsDB[(Toivelistat & klassikot)]
        MessagesDB[(Keskusteluviestit)]
    end

    %% Azure & GitHub
    subgraph Cloud["Azure + GitHub"]
        Azure["Azure<br/>• App Service / Container Apps<br/>• Azure Database for PostgreSQL<br/>"]
        GitHub["GitHub<br/>• Lähdekoodi<br/>• CI/CD"]
    end

    %% Ulkoiset palvelut
    subgraph External["Ulkoiset palvelut"]
        TMDB["TMDB API<br/>Elokuvien perustiedot"]
        Finnkino["Finnkino API<br/>(COULD)"]
    end

    %% Tiedonkulku
    Guest --> UI
    User --> UI
    Admin --> UI

    UI --> API
    AuthUI --> Auth
    GroupUI --> GroupService
    MovieUI --> ReviewService
    UI --> SearchService

    API --> Auth
    API --> GroupService
    API --> ReviewService
    API --> SearchService
    API --> Moderation
    API --> Recommend

    Auth --> UsersDB
    GroupService --> GroupsDB
    GroupService --> MessagesDB
    ReviewService --> ReviewsDB
    ReviewService --> ListsDB
    ReviewService --> MoviesDB
    SearchService --> MoviesDB
    Moderation --> MessagesDB
    Recommend --> ReviewsDB

    SearchService -.-> TMDB
    ReviewService -.-> TMDB
    Recommend -.-> Finnkino

    Backend --> Azure
    Database --> Azure
    Frontend --> Azure
    GitHub --> Azure

    %% Tyylit
    classDef frontend fill:#e1f5fe,stroke:#01579b,color:#000000
    classDef backend fill:#f3e5f5,stroke:#4a148c,color:#000000
    classDef db fill:#e8f5e9,stroke:#1b5e20,color:#000000
    classDef external fill:#fff3e0,stroke:#e65100,color:#000000
    classDef user fill:#fce4ec,stroke:#880e4f,color:#000000
    classDef cloud fill:#e3f2fd,stroke:#0d47a1,color:#000000

    class UI,AuthUI,GroupUI,MovieUI frontend
    class API,Auth,GroupService,ReviewService,SearchService,Moderation,Recommend backend
    class UsersDB,GroupsDB,MoviesDB,ReviewsDB,ListsDB,MessagesDB db
    class TMDB,Finnkino external
    class Guest,User,Admin user
    class Azure,GitHub cloud
```
**KIRJAUTUMINEN**

```mermaid
stateDiagram-v2
    state "Ei kirjautunut" as LoggedOut
    state "Kirjautuminen<br/>tarkistetaan" as CheckingLogin
    state "Kirjautunut" as LoggedIn

    [*] --> LoggedOut
    LoggedOut --> CheckingLogin: Asiakas lähettää tunnukset
    CheckingLogin --> LoggedIn: Tunnukset hyväksytään
    CheckingLogin --> LoggedOut: Tunnukset hylätään
    CheckingLogin --> LoggedOut: Tarkistus epäonnistuu
    LoggedIn --> LoggedOut: Asiakas kirjautuu ulos
    LoggedIn --> LoggedOut: Istunnon voimassaoloaika päättyy
```