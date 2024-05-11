$wallpaperPath = $args[0]
Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name 'Wallpaper' -Value $wallpaperPath

$signature = @"
using System;
using System.Runtime.InteropServices;

public class WallpaperUtils
{
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}

public class Program
{
    public static void Main()
    {
        WallpaperUtils.SystemParametersInfo(0x0014, 0, null, 0x0001);
    }
}
"@

Add-Type -TypeDefinition $signature -Language CSharp

[Program]::Main()