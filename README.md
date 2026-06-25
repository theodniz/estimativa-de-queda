# Estimativa de Queda

Aplicativo móvel para detecção de quedas usando sensores de movimento. Ele monitora aceleração e inclinação para identificar situações de queda e exibe alertas visuais e sonoros quando um evento é detectado.

## O que este app faz

- lê dados de sensores do dispositivo (aceleração e orientação)
- calcula a probabilidade de queda com base em thresholds personalizados
- exibe status de sensibilidade e evento em tempo real
- mostra alertas de queda e permite cancelar alarmes
- envia notificações quando a queda é detectada

## Como instalar

1. Abra o terminal no diretório do projeto:

   ```bash
   cd "c:\Users\theo\Desktop\Estimativa de queda\estimativa-de-queda"
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Se você não tiver o Expo CLI global instalado, instale com:

   ```bash
   npm install -g expo-cli
   ```

## Como rodar o app

1. Inicie o servidor do Expo:

   ```bash
   npx expo start
   ```

2. No terminal do Expo, escolha uma opção para abrir o app:

- `a` para rodar em emulador Android
- `i` para rodar no simulador iOS
- `w` para abrir no navegador
- escaneie o QR code com o Expo Go no celular

3. Para testar no dispositivo físico, instale o aplicativo Expo Go e escaneie o QR code exibido.

## Estrutura principal do projeto

- `App.js` — ponto de entrada do aplicativo
- `src/screens/HomeScreen.js` — UI principal do painel de detecção
- `src/hooks/useFallDetection.js` — lógica de detecção de quedas
- `src/components/` — componentes de interface reutilizáveis
- `src/services/notifications.js` — notificações do app
- `src/utils/fallAlgorithm.js` — algoritmo de análise de queda

## Observações

- Execute o app em um dispositivo com sensores de movimento para validar corretamente a detecção.
- Ajuste a sensibilidade no app para testar limites de queda diferentes.
- Caso precise limpar dependências, use:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Contribuição

Se quiser melhorar o app, crie uma branch nova, faça alterações e abra um pull request.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
