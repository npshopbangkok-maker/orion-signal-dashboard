#!/usr/bin/env python3
"""
TopstepX Auto Trading Script using pyautogui
ใช้สำหรับ auto trade โดยควบคุมเมาส์และคีย์บอร์ด
"""

import pyautogui
import time
import json
import sys
from typing import Dict, Any

class TopstepXDesktopAutomation:
    def __init__(self):
        # ป้องกันการเคลื่อนเมาส์ไปมุมจอ
        pyautogui.FAILSAFE = True
        
        # ความเร็วในการเคลื่อนเมาส์
        pyautogui.PAUSE = 0.5
        
        # พิกัดของ UI elements (ต้องปรับตามหน้าจอ)
        self.ui_elements = {
            'new_order_button': (100, 50),
            'symbol_input': (200, 100),
            'buy_button': (150, 150),
            'sell_button': (250, 150),
            'lot_size_input': (300, 200),
            'entry_price_input': (300, 250),
            'stop_loss_input': (300, 300),
            'take_profit_input': (300, 350),
            'submit_button': (400, 400)
        }

    def focus_topstepx(self):
        """เปลี่ยนไปที่หน้าต่าง TopstepX"""
        # หา TopstepX window และ focus
        pyautogui.hotkey('cmd', 'tab')  # macOS
        # หรือ pyautogui.hotkey('alt', 'tab')  # Windows
        time.sleep(1)

    def execute_signal(self, signal_data: Dict[str, Any]) -> bool:
        """เปิดเทรดตาม signal"""
        try:
            print(f"Executing trade for {signal_data['symbol']}")
            
            # 1. Focus TopstepX
            self.focus_topstepx()
            
            # 2. เปิด New Order (F9)
            pyautogui.press('f9')
            time.sleep(2)
            
            # 3. ใส่ Symbol
            self.enter_symbol(signal_data['symbol'])
            
            # 4. เลือก Direction
            self.set_direction(signal_data['direction'])
            
            # 5. ใส่ Lot Size
            lot_size = self.calculate_lot_size(signal_data)
            self.set_lot_size(lot_size)
            
            # 6. ใส่ Entry Price (ถ้ามี)
            if signal_data.get('entry_price'):
                self.set_entry_price(signal_data['entry_price'])
            
            # 7. ใส่ Stop Loss
            if signal_data.get('stop_loss'):
                self.set_stop_loss(signal_data['stop_loss'])
            
            # 8. ใส่ Take Profit
            if signal_data.get('take_profits'):
                self.set_take_profit(signal_data['take_profits'][0])
            
            # 9. Submit Order
            self.submit_order()
            
            print(f"Trade executed successfully for {signal_data['symbol']}")
            return True
            
        except Exception as e:
            print(f"Error executing trade: {e}")
            return False

    def enter_symbol(self, symbol: str):
        """ใส่ symbol ในช่อง search"""
        # Click symbol input
        pyautogui.click(self.ui_elements['symbol_input'])
        time.sleep(0.5)
        
        # Clear field
        pyautogui.hotkey('cmd', 'a')  # Select all
        pyautogui.press('delete')
        
        # Type symbol
        mapped_symbol = self.map_symbol(symbol)
        pyautogui.write(mapped_symbol)
        time.sleep(1)
        
        # Press Enter to select
        pyautogui.press('enter')

    def set_direction(self, direction: str):
        """ตั้งค่าทิศทางการเทรด"""
        if direction.lower() in ['long', 'buy']:
            # Click Buy button หรือใช้ hotkey
            pyautogui.hotkey('ctrl', 'b')
        elif direction.lower() in ['short', 'sell']:
            # Click Sell button หรือใช้ hotkey
            pyautogui.hotkey('ctrl', 's')

    def set_lot_size(self, lot_size: float):
        """ตั้งค่าขนาด lot"""
        pyautogui.click(self.ui_elements['lot_size_input'])
        time.sleep(0.5)
        
        pyautogui.hotkey('cmd', 'a')
        pyautogui.write(str(lot_size))

    def set_entry_price(self, price: float):
        """ตั้งค่าราคา entry"""
        pyautogui.click(self.ui_elements['entry_price_input'])
        time.sleep(0.5)
        
        pyautogui.hotkey('cmd', 'a')
        pyautogui.write(f"{price:.4f}")

    def set_stop_loss(self, stop_loss: float):
        """ตั้งค่า stop loss"""
        pyautogui.click(self.ui_elements['stop_loss_input'])
        time.sleep(0.5)
        
        pyautogui.hotkey('cmd', 'a')
        pyautogui.write(f"{stop_loss:.4f}")

    def set_take_profit(self, take_profit: float):
        """ตั้งค่า take profit"""
        pyautogui.click(self.ui_elements['take_profit_input'])
        time.sleep(0.5)
        
        pyautogui.hotkey('cmd', 'a')
        pyautogui.write(f"{take_profit:.4f}")

    def submit_order(self):
        """ส่ง order"""
        # Click Submit button
        pyautogui.click(self.ui_elements['submit_button'])
        time.sleep(2)
        
        # หรือใช้ Enter
        # pyautogui.press('enter')

    def calculate_lot_size(self, signal_data: Dict[str, Any]) -> float:
        """คำนวณขนาด lot ตาม risk management"""
        account_balance = 25000  # Funded account
        risk_percentage = 1  # 1% risk
        risk_amount = account_balance * (risk_percentage / 100)
        
        entry_price = signal_data.get('entry_price', signal_data.get('price', 0))
        stop_loss = signal_data.get('stop_loss', 0)
        
        if not entry_price or not stop_loss:
            return 0.01  # Default mini lot
        
        pip_risk = abs(entry_price - stop_loss)
        position_size = risk_amount / (pip_risk * 100)
        
        return max(0.01, min(position_size, 1.0))

    def map_symbol(self, symbol: str) -> str:
        """แปลง symbol เป็นรูปแบบของ TopstepX"""
        mapping = {
            'EURUSD': 'EURUSD',
            'GBPUSD': 'GBPUSD',
            'USDJPY': 'USDJPY',
            'XAUUSD': 'XAUUSD',
            'US30': 'YM',
            'NAS100': 'NQ',
            'SPX500': 'ES',
        }
        return mapping.get(symbol, symbol)

    def calibrate_ui_positions(self):
        """ปรับพิกัด UI elements ให้ตรงกับหน้าจอ"""
        print("Move mouse to each UI element and press SPACE to record position")
        print("Press ESC when done")
        
        elements = list(self.ui_elements.keys())
        current_element = 0
        
        while current_element < len(elements):
            element_name = elements[current_element]
            print(f"Position mouse over: {element_name}")
            
            while True:
                try:
                    if pyautogui.keyIsPressed('space'):
                        x, y = pyautogui.position()
                        self.ui_elements[element_name] = (x, y)
                        print(f"Recorded {element_name}: {x}, {y}")
                        current_element += 1
                        break
                    elif pyautogui.keyIsPressed('esc'):
                        return
                    time.sleep(0.1)
                except KeyboardInterrupt:
                    return
        
        # Save positions to file
        with open('topstepx_ui_positions.json', 'w') as f:
            json.dump(self.ui_elements, f, indent=2)
        print("UI positions saved to topstepx_ui_positions.json")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 topstepx_automation.py <signal_json>")
        return
    
    # Parse signal data
    signal_json = sys.argv[1]
    signal_data = json.loads(signal_json)
    
    # Create automation instance
    automation = TopstepXDesktopAutomation()
    
    # Execute trade
    success = automation.execute_signal(signal_data)
    
    if success:
        print("Trade executed successfully")
        sys.exit(0)
    else:
        print("Trade execution failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
