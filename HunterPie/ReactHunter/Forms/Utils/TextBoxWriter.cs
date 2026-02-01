using System.IO;
using System.Text;
using System.Windows.Forms;



class TextBoxWriter : TextWriter

{
    readonly TextBox textBox;
    delegate void WriteFunc(string value);
    readonly WriteFunc write;
    readonly WriteFunc writeLine;

    public TextBoxWriter(TextBox textBox)
    {
        this.textBox = textBox;
        write = Write;
        writeLine = WriteLine;
    }

    public override Encoding Encoding => Encoding.Unicode;

    public override void Write(string value)
    {
        if (textBox.InvokeRequired)
            textBox.BeginInvoke(write, value);
        else
            textBox.AppendText(value);
    }

    public override void WriteLine(string value)
    {
        if (textBox.InvokeRequired)
            textBox.BeginInvoke(writeLine, value);
        else
        {
            textBox.AppendText(value);
            textBox.AppendText(NewLine);
        }
    }
}