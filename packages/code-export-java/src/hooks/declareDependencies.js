let dependencies = `
import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.is;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import java.util.HashMap;

`

function register(dependency) {
  dependencies += dependency + '\r\n'
}

function emit() {
  return dependencies
}

export default {
  emit,
  register,
}
