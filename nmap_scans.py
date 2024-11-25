from nmap3 import Nmap
import datetime
import os
import pathlib


class scan():
    nm = Nmap()
    multi_scan = True
    def scan(self, ip, notation, top, auto):
        scan_arg = '-O'
        if notation != "0": #If notation is not == 0
            octets = ip.split(".") #Split IP into parts
            octets[-1] = "0" #Replaces the last item with a 0
            ip = ".".join(octets) #Rejoin the octets
            ip = ip + f"/{notation}"#append the notation to the IP

        while scan.multi_scan == True:
            date = datetime.datetime.now().strftime("%Y-%m-%d")
            time_now = datetime.datetime.now().strftime("%H:%M")
            now = f"{date} {time_now}"
            if top:
                sub_scan = scan.nm.scan_top_ports(target=ip, args=scan_arg)
            else:
                sub_scan = scan.nm.nmap_subnet_scan(target=ip, args=scan_arg)
            scan.multi_scan = auto

        for host, info in sub_scan.items():
            print("\n HOST!!!!!",host,"\n INFO!!!!!",info,"\n ITEMS!!!!",sub_scan.items())
        print("scan os")

        if dev == True:
            print(
            f"""
            ||==@=~~==@=~~==@=~~==@=~~=@==||
                IP address: {ip}
                notation: {notation}
                top: {top}              
                automation: {auto}      
                sleep: {sleeper} seconds
            ||==@=~~==@=~~==@=~~==@=~~=@==||
            """
            )

if __name__ == "__main__":
    ip = "127.0.0.1"
    notation = "0"
    scan_mode = "none"
    top = True
    auto = False
    sleeper = 3
    dev = True
    scanner = scan()
    scanner.scan(ip, notation, top, auto)

    