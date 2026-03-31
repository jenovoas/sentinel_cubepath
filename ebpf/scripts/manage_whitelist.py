#!/usr/bin/env python3
"""
ME-60OS AI Guardian - Whitelist Management Utility
Copyright (c) 2026 ME-60OS Development Team

Gestiona la whitelist dinámica de paths permitidos para agentes AI.
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path

PIN_DIR = "/sys/fs/bpf/ai_guardian"
WHITELIST_MAP = f"{PIN_DIR}/ai_whitelist_map"
ALLOW_AI = 1
BLOCK_AI = 0

def check_loaded():
    """Verifica que el módulo AI Guardian esté cargado"""
    if not os.path.exists(WHITELIST_MAP):
        print(f"❌ ERROR: AI Guardian no está cargado")
        print(f"   No se encuentra: {WHITELIST_MAP}")
        print(f"   Ejecuta: sudo ./ebpf/scripts/load_ai_guardian.sh")
        sys.exit(1)

def path_to_hex(path: str) -> str:
    """Convierte un path a representación hexadecimal (256 bytes)"""
    # Convertir a bytes
    path_bytes = path.encode('utf-8')
    
    # Truncar o rellenar a 256 bytes
    if len(path_bytes) > 256:
        path_bytes = path_bytes[:256]
    else:
        path_bytes = path_bytes + b'\x00' * (256 - len(path_bytes))
    
    # Convertir a hex
    return path_bytes.hex()

def value_to_hex(allow: bool) -> str:
    """Convierte valor de política a hex (8 bytes little-endian)"""
    value = ALLOW_AI if allow else BLOCK_AI
    return f"{value:016x}"

def add_path(path: str, allow: bool = True):
    """Agrega un path a la whitelist"""
    check_loaded()
    
    # Expandir path a absoluto
    abs_path = os.path.abspath(os.path.expanduser(path))
    
    key_hex = path_to_hex(abs_path)
    value_hex = value_to_hex(allow)
    
    cmd = [
        "bpftool", "map", "update",
        "pinned", WHITELIST_MAP,
        "key", "hex", key_hex,
        "value", "hex", value_hex
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        status = "✅ PERMITIDO" if allow else "🚫 BLOQUEADO"
        print(f"{status}: {abs_path}")
    except subprocess.CalledProcessError as e:
        print(f"❌ ERROR al agregar {abs_path}")
        print(f"   {e.stderr.decode()}")
        sys.exit(1)

def remove_path(path: str):
    """Elimina un path de la whitelist"""
    check_loaded()
    
    abs_path = os.path.abspath(os.path.expanduser(path))
    key_hex = path_to_hex(abs_path)
    
    cmd = [
        "bpftool", "map", "delete",
        "pinned", WHITELIST_MAP,
        "key", "hex", key_hex
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"🗑️  Eliminado: {abs_path}")
    except subprocess.CalledProcessError as e:
        print(f"❌ ERROR al eliminar {abs_path}")
        print(f"   {e.stderr.decode()}")
        sys.exit(1)

def list_whitelist():
    """Lista todos los paths en la whitelist"""
    check_loaded()
    
    cmd = ["bpftool", "map", "dump", "pinned", WHITELIST_MAP, "-j"]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True)
        import json
        
        data = json.loads(result.stdout.decode())
        
        if not data:
            print("📝 Whitelist vacía")
            return
        
        print("📝 Whitelist actual:")
        print("=" * 80)
        
        for entry in data:
            # Decodificar key (path)
            key_hex = ''.join(entry['key'])
            key_bytes = bytes.fromhex(key_hex)
            path = key_bytes.rstrip(b'\x00').decode('utf-8', errors='ignore')
            
            # Decodificar value (policy)
            value_hex = ''.join(entry['value'])
            value = int(value_hex, 16)
            
            status = "✅ PERMITIDO" if value == ALLOW_AI else "🚫 BLOQUEADO"
            print(f"{status}: {path}")
        
        print("=" * 80)
        print(f"Total: {len(data)} entradas")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ ERROR al listar whitelist")
        print(f"   {e.stderr.decode()}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ ERROR al parsear salida de bpftool")
        sys.exit(1)

def import_from_file(filename: str):
    """Importa whitelist desde archivo de texto"""
    check_loaded()
    
    if not os.path.exists(filename):
        print(f"❌ ERROR: Archivo no encontrado: {filename}")
        sys.exit(1)
    
    print(f"📥 Importando desde {filename}...")
    
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            
            # Ignorar comentarios y líneas vacías
            if not line or line.startswith('#'):
                continue
            
            # Formato: [+/-]path
            if line.startswith('-'):
                path = line[1:].strip()
                add_path(path, allow=False)
            elif line.startswith('+'):
                path = line[1:].strip()
                add_path(path, allow=True)
            else:
                add_path(line, allow=True)
    
    print("✅ Importación completada")

def export_to_file(filename: str):
    """Exporta whitelist a archivo de texto"""
    check_loaded()
    
    cmd = ["bpftool", "map", "dump", "pinned", WHITELIST_MAP, "-j"]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True)
        import json
        
        data = json.loads(result.stdout.decode())
        
        with open(filename, 'w') as f:
            f.write("# ME-60OS AI Guardian Whitelist\n")
            f.write("# Formato: [+/-]path\n")
            f.write("# + = PERMITIDO, - = BLOQUEADO\n\n")
            
            for entry in data:
                key_hex = ''.join(entry['key'])
                key_bytes = bytes.fromhex(key_hex)
                path = key_bytes.rstrip(b'\x00').decode('utf-8', errors='ignore')
                
                value_hex = ''.join(entry['value'])
                value = int(value_hex, 16)
                
                prefix = '+' if value == ALLOW_AI else '-'
                f.write(f"{prefix}{path}\n")
        
        print(f"✅ Exportado a {filename}")
        print(f"   Total: {len(data)} entradas")
        
    except Exception as e:
        print(f"❌ ERROR al exportar: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="ME-60OS AI Guardian - Whitelist Management",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  # Agregar path permitido
  %(prog)s add /etc/passwd
  
  # Agregar path bloqueado
  %(prog)s add --block /etc/shadow
  
  # Eliminar path
  %(prog)s remove /etc/passwd
  
  # Listar whitelist
  %(prog)s list
  
  # Importar desde archivo
  %(prog)s import whitelist.txt
  
  # Exportar a archivo
  %(prog)s export whitelist_backup.txt
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Comando a ejecutar')
    
    # Comando: add
    add_parser = subparsers.add_parser('add', help='Agregar path a whitelist')
    add_parser.add_argument('path', help='Path a agregar')
    add_parser.add_argument('--block', action='store_true', help='Bloquear en lugar de permitir')
    
    # Comando: remove
    remove_parser = subparsers.add_parser('remove', help='Eliminar path de whitelist')
    remove_parser.add_argument('path', help='Path a eliminar')
    
    # Comando: list
    subparsers.add_parser('list', help='Listar whitelist actual')
    
    # Comando: import
    import_parser = subparsers.add_parser('import', help='Importar desde archivo')
    import_parser.add_argument('file', help='Archivo a importar')
    
    # Comando: export
    export_parser = subparsers.add_parser('export', help='Exportar a archivo')
    export_parser.add_argument('file', help='Archivo de destino')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Ejecutar comando
    if args.command == 'add':
        add_path(args.path, allow=not args.block)
    elif args.command == 'remove':
        remove_path(args.path)
    elif args.command == 'list':
        list_whitelist()
    elif args.command == 'import':
        import_from_file(args.file)
    elif args.command == 'export':
        export_to_file(args.file)

if __name__ == '__main__':
    main()
