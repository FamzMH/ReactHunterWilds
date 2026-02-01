using System.Windows.Forms;

namespace HunterPie.ReactHunter.Forms;

partial class Form1
{
    private System.ComponentModel.IContainer components = null;

    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }
        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
        this.textBox1 = new System.Windows.Forms.TextBox();
        this.SuspendLayout();
        // 
        // textBox1
        // 
        this.textBox1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
        | System.Windows.Forms.AnchorStyles.Left) 
        | System.Windows.Forms.AnchorStyles.Right)));
        this.textBox1.BackColor = System.Drawing.Color.Black;
        this.textBox1.Font = new System.Drawing.Font("Arial", 14.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
        this.textBox1.ForeColor = System.Drawing.Color.LightGray;
        this.textBox1.Location = new System.Drawing.Point(0, 0);
        this.textBox1.Multiline = true;
        this.textBox1.Name = "textBox1";
        this.textBox1.ReadOnly = true;
        this.textBox1.Size = new System.Drawing.Size(759, 431);
        this.textBox1.TabIndex = 0;
        this.textBox1.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
        // 
        // Form1
        // 
        this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
        this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
        this.ClientSize = new System.Drawing.Size(759, 431);
        this.Controls.Add(this.textBox1);
        this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
        this.Name = "Form1";
        this.Text = "ReactHunter";
        this.Load += new System.EventHandler(this.Form1_Load);
        this.Shown += new System.EventHandler(this.Form1_Shown);
        this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Form1_Closing);
        this.ResumeLayout(false);
        this.PerformLayout();

    }

    private System.Windows.Forms.TextBox textBox1;
}

