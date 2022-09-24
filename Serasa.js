const { Builder, By, Key } = require("selenium-webdriver");
require("chromedriver");

//Antes de iniciar a automação é necessário alterar os valores para os desejados.
//Checar variável 'monthToTick' com os valores de cada mês
const amountGoal = 1000;
const monthGoal = 0;
const monthToTick = {
  0: 6,
  1: 12,
  2: 24,
  3: 36,
};

const moveBy = (slider, value) => {
  if (value === 0) return;
  let key = value > 0 ? Key.ARROW_RIGHT : Key.ARROW_LEFT;
  value = Math.abs(value);
  for (let i = 1; i <= value; i++) {
    slider.sendKeys(key);
  }
};

const calculateAmountTicks = (current, goal) => {
  let difference = current - goal;
  return (difference / 250) * -1;
};

(async function main() {
  let driver = await new Builder().forBrowser("chrome").build();
  await driver.get("https://www.serasa.com.br/ecred/simulador");

  const checkResult = async (expectedAmount, expectedMonths) => {
    const amountString = await driver
      .findElement(By.id("amount"))
      .getAttribute("innerHTML");
    const amountValue = parseInt(amountString.slice(3, -3).replace(".", ""));
    if (expectedAmount !== amountValue) {
      console.error(`${expectedAmount} !== ${amountValue}`);
      throw new Error(
        `Testes falharam ❌. O valor: ${amountValue}, não é o mesmo da quantia esperada: ${expectedAmount}.`
      );
    }
    console.log(
      `Testes bem sucedidos ✔. O valor: ${amountValue}, é o mesmo da quantia esperada: ${expectedAmount}.`
    );

    const monthsString = await driver
      .findElement(By.id("month-amount"))
      .getAttribute("innerHTML");
    const monthsValue = parseInt(monthsString.replace(/\D/g, ""));
    if (expectedMonths !== monthsValue) {
      console.error(`${expectedMonths} !== ${monthsValue}`);
      throw new Error(
        `Testes falharam ❌. O prazo de: ${monthsValue} meses, não é o mesmo do esperado: ${expectedMonths} meses.`
      );
    }
    console.log(
      `Testes bem sucedidos ✔. O prazo de: ${monthsValue} meses, é o mesmo do esperado: ${expectedMonths} meses.`
    );
  };

  const sliderAmount = driver.findElement(By.id("slider-range"));
  const sliderMonths = driver.findElement(By.id("slider-range-month"));

  /*
   * Fix tick bug from browser
   * Após atualizar a página, o Slider de meses, pula um index de 6 meses, para 24 meses. Com um clique na seta direita
   * @BUG [CROSS-BROWSER]
   */
  sliderMonths.sendKeys(Key.ARROW_RIGHT);
  sliderMonths.sendKeys(Key.ARROW_LEFT);
  sliderMonths.sendKeys(Key.ARROW_LEFT);
  /*
   * Após atualizar a página, o Slider de meses, pula um index de 6 meses, para 24 meses. Com um clique na seta direita
   * Fix tick bug from browser
   */

  moveBy(sliderAmount, calculateAmountTicks(5000, amountGoal));
  moveBy(sliderMonths, monthGoal);
  checkResult(amountGoal, monthToTick[monthGoal]);
})();

/* 
  Given usuário acessa a url: 'https://www.serasa.com.br/ecred/simulador'
  And Move o slider de 'valor' para a posição: '1000'
  And Move o slider de 'prazo' para a posição: '6 meses'
  And verifica se os dados na tela estão de acordo
  Then aguarda por '2' segundos
  And Move o slider de 'valor' para a posição: '4000'
  And Move o slider de 'prazo' para a posição: '12 meses'
  And verifica se os dados na tela estão de acordo
  Then aguarda por '2' segundos
  And Move o slider de 'valor' para a posição: '6000'
  And Move o slider de 'prazo' para a posição: '24 meses'
  Then verifica se os dados na tela estão de acordo
*/
