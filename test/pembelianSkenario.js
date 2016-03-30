/**
 * Created by riansyahPC on 3/19/2016.
 * skenario : membeli 2 produk -> keranjang -> konfirmasi -> konfirmasi pembayaran
 */
var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder().forBrowser('firefox').build();
driver.get('http://localhost:3000/produk/beli/2');
driver.findElement(By.name('beliProduk')).click();
driver.get('http://localhost:3000/produk/beli/1');
driver.findElement(By.name('beliProduk')).click();
driver.findElement(By.name('btnKonfirmasi')).click();

driver.quit();

//driver.getTitle().then(function(title){
//    console.log(title)
//});
//driver.findElement(By.name('q')).sendKeys('webdriver');
//driver.findElement(By.name('btnG')).click();
//driver.wait(until.titleIs('webdriver - Google Search'), 3000);
//driver.quit();
//var webdriver = require('selenium-webdriver');
//
//var driver = new webdriver.Builder().build();
//driver.get('http://www.google.com');
//
//var element = driver.findElement(webdriver.By.name('q'));
//element.sendKeys('Cheese!');

//driver.quit();