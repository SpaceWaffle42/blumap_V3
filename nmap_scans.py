from nmap3 import Nmap
import datetime
from database import Database as db
import time

class scan():
    nm = Nmap()

    def scan(ip, notation, scan_notation, top, auto, sleeper):
        if scan_notation == "on":
            # print(type(scan_notation))
            scan_notation = True
        dev = True
        multi_scan = True

        if not notation and scan_notation == True:
            notation = 24

        if not ip:
            ip = "127.0.0.1"

        scan_arg = '-O'
        if notation != "0" and ip != "127.0.0.1" and scan_notation == True: #If notation is not == 0 and not localhost
            octets = ip.split(".") #Split IP into parts
            octets[-1] = "0" #Replaces the last item with a 0
            try: 
                octets[-1] = int(octets[-1])
            except:
                ip = ".".join(octets) #Rejoin the octets
            ip = ip + f"/{notation}"#append the notation to the IP

        if dev == True:
                    print(
                    f"""
                    ||==@=~~==@=~~==@=~~==@=~~=@==||
                        IP address: {ip}
                        notation: {notation}
                        scan notation: {scan_notation}
                        top: {top}              
                        automation: {auto}      
                        sleep: {sleeper} seconds
                    ||==@=~~==@=~~==@=~~==@=~~=@==||
                    """
                    )

        while multi_scan == True:
            date = datetime.datetime.now().strftime("%Y-%m-%d")
            time_now = datetime.datetime.now().strftime("%H:%M")
            now = f"{date} {time_now}"

            if top:
                sub_scan = scan.nm.scan_top_ports(target=ip, args=scan_arg)

            elif not top or scan_notation == True:
                sub_scan = scan.nm.nmap_subnet_scan(target=ip, args=scan_arg)

            multi_scan = auto

            for host_, details in sub_scan.items():
                if type(details) == dict:
                    try:
                            mac = details.get("macaddress", {})["addr"]
                    except:
                        mac = None
                    try:
                        vendor = details.get("macaddress", {})["vendor"]
                    except:
                        vendor = None

                    try:
                        cpe = None
                        os_name = None
                        host_name = None
                        accuracy = None

                        p_open = []
                        p_closed = []
                        p_filtered = []

                        if len(details.get("ports", [])) > 0:
                            for port_info in details["ports"]:
                                if len(details["osmatch"]) >= 0:
                                    
                                    try:
                                        cpe = details["osmatch"][0]["cpe"]
                                    except:
                                        cpe = None

                                    try:
                                        os_name = details["osmatch"][0]["name"]
                                    except:
                                        os_name = None

                                    try:
                                        accuracy = details["osmatch"][0]["accuracy"]
                                    except:
                                        accuracy = None

                                    try:
                                        host_name = details["hostname"][0]["name"]
                                    except:
                                        host_name = None

                                if "closed" in port_info['state']:
                                    p_closed.append(f" {int(port_info['portid'])}")

                                if "open" in port_info['state']:
                                    p_open.append(f" {int(port_info['portid'])}")

                                if "filtered" in port_info['state']:
                                    p_filtered.append(f" {int(port_info['portid'])}")
                                    
                    except Exception as e:
                        print(f"Assignment  |   nmap_scans Error: {e}")

                if host_name == None and mac == None and len(p_closed) == 0 and len(p_open) == 0 and len(p_filtered) == 0:
                    pass
                else:
                    db.save(host_, host_name, mac, vendor, os_name, accuracy, cpe, p_open, p_closed, p_filtered, now, notation)
                    print(f"Scan performed at {now}")
                time.sleep(int(sleeper))
                multi_scan = False

                            # print(key, value,'\n')
if __name__ == "__main__":
    ip = "127.0.0.1"
    notation = "0"
    scan_mode = "none"
    top = False
    auto = True
    sleeper = 0
    dev = False
    scanner = scan()
    scanner.scan(ip, notation, top, auto)

    