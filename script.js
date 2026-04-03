// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: wallet;
/**
USDT Balance Widget for BNB Chain
Created for Scriptable.app
 */
// Default address if no widget parameter is provided
const DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
const RPC_URL = "https://bsc-dataseed.binance.org/";
// Get address from widget parameter or use default
let walletAddress = args.widgetParameter || DEFAULT_ADDRESS;
// Simple validation
if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
  walletAddress = DEFAULT_ADDRESS;
}
async function getUSDTBalance(address) {
  const data = "0x70a08231" + address.substring(2).padStart(64, "0");
  const req = new Request(RPC_URL);
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{ to: USDT_CONTRACT, data: data }, "latest"],
    id: 1
  });
  try {
    const res = await req.loadJSON();
    if (res.error) throw new Error(res.error.message);
    const hex = res.result;
    // Convert hex to decimal (USDT on BSC has 18 decimals)
    const balance = BigInt(hex);
    const divisor = BigInt(10 ** 18);
    const integerPart = balance / divisor;
    const fractionalPart = balance % divisor;
    // Format to 2 decimal places
    const fractionStr = fractionalPart.toString().padStart(18, "0").substring(0, 2);
    return `${integerPart}.${fractionStr}`;
  } catch (e) {
    console.error(e);
    return "Error";
  }
}
async function createWidget() {
  if (!walletAddress || walletAddress === "0x0000000000000000000000000000000000000000") {
    const widget = new ListWidget();
    const gradient = new LinearGradient();
    gradient.colors = [new Color("#1a1a1a"), new Color("#0a0a0a")];
    gradient.locations = [0, 1];
    widget.backgroundGradient = gradient;
    widget.addSpacer();
    const emojiText = widget.addText("");
    emojiText.font = Font.systemFont(32);
    emojiText.centerAlignText();
    widget.addSpacer(8);
    const msgText = widget.addText("Address Not Set");
    msgText.font = Font.boldSystemFont(14);
    msgText.textColor = Color.white();
    msgText.centerAlignText();
    widget.addSpacer(4);
    const subText = widget.addText("Please configure your BSC address in the widget parameters ");
    subText.font = Font.mediumSystemFont(10);
    subText.textColor = Color.white();
    subText.textOpacity = 0.6;
    subText.centerAlignText();
    widget.addSpacer();
    return widget;
  }
  const balance = await getUSDTBalance(walletAddress);
  const widget = new ListWidget();
  // Background
  const gradient = new LinearGradient();
  gradient.colors = [new Color("#1a1a1a"), new Color("#0a0a0a")];
  gradient.locations = [0, 1];
  widget.backgroundGradient = gradient;
  widget.addSpacer(8);
  // Title
  const titleStack = widget.addStack();
  const titleText = titleStack.addText("USDT BALANCE");
  titleText.font = Font.boldSystemFont(10);
  titleText.textColor = new Color("#f3ba2f", 0.6);
  titleText.centerAlignText();
  widget.addSpacer(4);
  // Balance
  const balanceStack = widget.addStack();
  balanceStack.bottomAlignContent();
  const balanceText = balanceStack.addText(balance);
  balanceText.font = Font.systemFont(32);
  balanceText.textColor = Color.white();
  const symbolText = balanceStack.addText(" USDT");
  symbolText.font = Font.systemFont(14);
  symbolText.textColor = new Color("#f3ba2f");
  widget.addSpacer(4);
  // Network
  const footerStack = widget.addStack();
  footerStack.centerAlignContent();
  const footerText = footerStack.addText("BNB Smart Chain");
  footerText.font = Font.mediumSystemFont(10);
  footerText.textColor = Color.white();
  footerText.textOpacity = 0.4;
  footerStack.addSpacer();
  const addrText = footerStack.addText(walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4));
  addrText.font = Font.mediumSystemFont(8);
  addrText.textColor = Color.white();
  addrText.textOpacity = 0.2;
  widget.addSpacer();
  // Last Updated
  const df = new DateFormatter();
  df.useShortTimeStyle();
  const timeText = widget.addText("Updated " + df.string(new Date()));
  timeText.font = Font.systemFont(8);
  timeText.textColor = Color.white();
  timeText.textOpacity = 0.2;
  widget.url = "https://bscscan.com/address/" + walletAddress;
  return widget;
}
if (config.runsInWidget) {
  const widget = await createWidget();
  Script.setWidget(widget);
} else {
  const widget = await createWidget();
  await widget.presentSmall();
}
Script.complete();
