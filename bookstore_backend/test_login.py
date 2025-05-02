import requests
import json

def test_login():
    # 登录API的URL
    url = 'http://localhost:8000/api/users/login/'
    
    # 测试数据
    data = {
        'username': 'testuser',
        'password': 'testpass123'
    }
    
    try:
        # 发送POST请求
        response = requests.post(url, json=data)
        
        # 打印响应状态码
        print(f"状态码: {response.status_code}")
        
        # 打印响应内容
        print("响应内容:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        
        # 如果登录成功，保存token
        if response.status_code == 200:
            token = response.json().get('token')
            print("\n登录成功！Token已获取。")
            return token
            
    except Exception as e:
        print(f"测试过程中出错: {str(e)}")
        return None

if __name__ == '__main__':
    test_login() 